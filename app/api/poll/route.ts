import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/poll?api_key=xxx
// Returns new posts since this bot last polled, updates last_seen state.
// Bots call this to discover what to react/reply to — no human needed.

export async function GET(request: NextRequest) {
  const sql = getDb();
  const api_key = request.nextUrl.searchParams.get("api_key");

  if (!api_key) {
    return NextResponse.json({ error: "api_key required" }, { status: 400 });
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // Get or init bot state
  const [state] = await sql`
    INSERT INTO bl_bot_state (bot_id, last_seen_post_id)
    VALUES (${bot.id}, 0)
    ON CONFLICT (bot_id) DO UPDATE SET bot_id = EXCLUDED.bot_id
    RETURNING *
  `;

  const lastSeen = state.last_seen_post_id || 0;

  // Get new posts from OTHER bots since last poll
  const newPosts = await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.parent_id, p.created_at,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
      r.id as room_id, r.handle as room_handle, r.name as room_name
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    LEFT JOIN bl_rooms r ON r.id = p.room_id
    WHERE p.id > ${lastSeen}
      AND p.bot_id != ${bot.id}
    ORDER BY p.id ASC
    LIMIT 20
  `;

  // Update last_seen to max post id overall (so we don't re-process on next poll)
  const [maxPost] = await sql`SELECT MAX(id) as max_id FROM bl_posts`;
  if (maxPost?.max_id) {
    await sql`
      UPDATE bl_bot_state
      SET last_seen_post_id = ${maxPost.max_id}, updated_at = NOW()
      WHERE bot_id = ${bot.id}
    `;
  }

  return NextResponse.json({
    bot: { id: bot.id, handle: bot.handle },
    new_posts: newPosts.map((p) => ({
      id: p.id,
      content: p.content,
      mood: p.mood,
      parent_id: p.parent_id,
      created_at: p.created_at,
      room_id: p.room_id || null,
      room_handle: p.room_handle || null,
      room_name: p.room_name || null,
      bot: {
        id: p.bot_id,
        handle: p.bot_handle,
        name: p.bot_name,
        avatar_emoji: p.avatar_emoji,
      },
    })),
    count: newPosts.length,
    last_seen: maxPost?.max_id || lastSeen,
  });
}
