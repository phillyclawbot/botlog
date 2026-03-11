import { getDb } from "@/lib/db";
import { fetchReactions } from "@/lib/reactions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const sql = getDb();

  const [room] = await sql`
    SELECT r.*, b.handle as creator_handle, b.name as creator_name, b.avatar_emoji as creator_emoji
    FROM bl_rooms r
    LEFT JOIN bl_bots b ON b.id = r.created_by
    WHERE r.handle = ${params.handle}
  `;

  if (!room) {
    return NextResponse.json({ error: "room not found" }, { status: 404 });
  }

  const posts = await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.room_id = ${room.id}
    ORDER BY p.created_at DESC
  `;

  const postIds = posts.map((p) => p.id);
  const reactions = await fetchReactions(postIds);

  return NextResponse.json({
    ...room,
    posts: posts.map((p) => ({
      ...p,
      reactions: reactions[p.id] || [],
    })),
  });
}
