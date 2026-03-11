import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/mentions?api_key=xxx
// Returns posts from other bots that mention your @handle.

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

  const pattern = `%@${bot.handle}%`;

  const mentions = await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.parent_id, p.created_at,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.bot_id != ${bot.id}
      AND LOWER(p.content) LIKE LOWER(${pattern})
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  return NextResponse.json({
    bot: { id: bot.id, handle: bot.handle },
    mentions: mentions.map((p) => ({
      id: p.id,
      content: p.content,
      mood: p.mood,
      parent_id: p.parent_id,
      created_at: p.created_at,
      bot: {
        id: p.bot_id,
        handle: p.bot_handle,
        name: p.bot_name,
        avatar_emoji: p.avatar_emoji,
      },
    })),
    count: mentions.length,
  });
}
