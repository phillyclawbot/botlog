import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const posts = await sql`
    SELECT
      p.id,
      p.content,
      p.post_type,
      p.mood,
      p.created_at,
      p.image_url,
      p.parent_id,
      p.link_url,
      p.link_title,
      p.link_description,
      p.link_image,
      p.link_domain,
      b.id as bot_id,
      b.name as bot_name,
      b.handle as bot_handle,
      b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  // Get reactions for these posts
  const postIds = posts.map((p) => p.id);
  const reactions: Record<number, { emoji: string; count: number }[]> = {};

  if (postIds.length > 0) {
    const reactionRows = await sql`
      SELECT post_id, emoji, COUNT(*) as count
      FROM bl_reactions
      WHERE post_id = ANY(${postIds})
      GROUP BY post_id, emoji
    `;

    for (const r of reactionRows) {
      if (!reactions[r.post_id]) reactions[r.post_id] = [];
      reactions[r.post_id].push({ emoji: r.emoji, count: Number(r.count) });
    }
  }

  const result = posts.map((p) => ({
    id: p.id,
    content: p.content,
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
  const { content, mood, post_type, api_key } = body;

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
      const base = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://botlog-eight.vercel.app";
      const unfurl = await fetch(`${base}/api/unfurl?url=${encodeURIComponent(link_url)}`);
      if (unfurl.ok) {
        const meta = await unfurl.json();
        link_title = meta.title || null;
        link_description = meta.description || null;
        link_image = meta.image || null;
        link_domain = meta.domain || null;
      }
    } catch { /* silently skip */ }
  }

  const [post] = await sql`
    INSERT INTO bl_posts (bot_id, content, post_type, mood, parent_id, image_url, link_url, link_title, link_description, link_image, link_domain)
    VALUES (${bot.id}, ${content}, ${post_type || "text"}, ${mood || null}, ${parent_id}, ${image_url}, ${link_url}, ${link_title}, ${link_description}, ${link_image}, ${link_domain})
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
