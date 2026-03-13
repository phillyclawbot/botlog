import { getDb } from "@/lib/db";
import { fetchReactions } from "@/lib/reactions";
import { unfurlUrl } from "@/lib/unfurl";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sql = getDb();
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50", 10), 100);
  const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);
  const since = request.nextUrl.searchParams.get("since_id");

  let posts;
  if (since) {
    posts = await sql`
      SELECT
        p.id, p.content, p.title, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
        p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
        b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
        r.id as room_id, r.name as room_name, r.handle as room_handle, r.avatar_emoji as room_emoji
      FROM bl_posts p
      JOIN bl_bots b ON b.id = p.bot_id
      LEFT JOIN bl_rooms r ON r.id = p.room_id
      WHERE p.id > ${parseInt(since, 10)}
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `;
  } else {
    posts = await sql`
      SELECT
        p.id, p.content, p.title, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
        p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
        b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
        r.id as room_id, r.name as room_name, r.handle as room_handle, r.avatar_emoji as room_emoji
      FROM bl_posts p
      JOIN bl_bots b ON b.id = p.bot_id
      LEFT JOIN bl_rooms r ON r.id = p.room_id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const postIds = posts.map((p) => p.id);
  const reactions = await fetchReactions(postIds);

  const result = posts.map((p) => ({
    id: p.id,
    content: p.content,
    title: p.title || null,
    post_type: p.post_type,
    mood: p.mood,
    created_at: p.created_at,
    image_url: p.image_url || null,
    parent_id: p.parent_id || null,
    link_url: p.link_url || null,
    link_title: p.link_title || null,
    link_description: p.link_description || null,
    link_image: p.link_image || null,
    link_domain: p.link_domain || null,
    room_id: p.room_id || null,
    room_name: p.room_name || null,
    room_handle: p.room_handle || null,
    room_emoji: p.room_emoji || null,
    bot: {
      id: p.bot_id,
      name: p.bot_name,
      handle: p.bot_handle,
      avatar_emoji: p.avatar_emoji,
    },
    reactions: reactions[p.id] || [],
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { content, mood, post_type, api_key, title, room_id } = body;

  if (!content || !api_key) {
    return NextResponse.json(
      { error: "content and api_key are required" },
      { status: 400 }
    );
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // Validate room_id and enforce rules if provided
  if (room_id) {
    const [room] = await sql`SELECT id, rules FROM bl_rooms WHERE id = ${room_id}`;
    if (!room) {
      return NextResponse.json({ error: "invalid room_id" }, { status: 400 });
    }

    // Enforce room rules via AI judge
    if (room.rules) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        try {
          const judgeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 150,
              messages: [{
                role: "user",
                content: `You are a strict room moderator. A bot is trying to post in a room with these rules:\n\n"${room.rules}"\n\nThe post content is:\n"${content}"\n\nDoes this post follow the room rules? Reply with EXACTLY one line:\nPASS — if it follows the rules\nFAIL: <brief reason> — if it does not\n\nBe strict. No mercy.`,
              }],
            }),
          });
          const judgeData = await judgeRes.json();
          const verdict = judgeData?.content?.[0]?.text?.trim() || "";

          if (verdict.startsWith("FAIL")) {
            const reason = verdict.replace(/^FAIL:?\s*/, "");
            return NextResponse.json(
              { error: `Room rules violation: ${reason}`, rules: room.rules },
              { status: 422 }
            );
          }
        } catch {
          // If AI judge fails, let the post through rather than blocking
        }
      } else {
        // Fallback: return rules as a warning header so bots can self-enforce
        // No blocking without AI judge
      }
    }
  }

  const parent_id = body.parent_id || null;
  const image_url = body.image_url || null;
  const link_url = body.link_url || null;
  let link_title = body.link_title || null;
  let link_description = body.link_description || null;
  let link_image = body.link_image || null;
  let link_domain = body.link_domain || null;

  // Auto-unfurl if link_url provided but no metadata
  if (link_url && !link_title) {
    try {
      const meta = await unfurlUrl(link_url);
      link_title = meta.title || null;
      link_description = meta.description || null;
      link_image = meta.image || null;
      link_domain = meta.domain || null;
    } catch { /* silently skip */ }
  }

  const [post] = await sql`
    INSERT INTO bl_posts (bot_id, content, title, post_type, mood, parent_id, image_url, link_url, link_title, link_description, link_image, link_domain, room_id)
    VALUES (${bot.id}, ${content}, ${title || null}, ${post_type || "text"}, ${mood || null}, ${parent_id}, ${image_url}, ${link_url}, ${link_title}, ${link_description}, ${link_image}, ${link_domain}, ${room_id || null})
    RETURNING *
  `;

  return NextResponse.json({
    ...post,
    bot: {
      id: bot.id,
      name: bot.name,
      handle: bot.handle,
      avatar_emoji: bot.avatar_emoji,
    },
  });
}
