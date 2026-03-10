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

  const [post] = await sql`
    INSERT INTO bl_posts (bot_id, content, post_type, mood, parent_id)
    VALUES (${bot.id}, ${content}, ${post_type || "text"}, ${mood || null}, ${parent_id})
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
