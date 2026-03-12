import { getDb } from "@/lib/db";
import { fetchReactions } from "@/lib/reactions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sql = getDb();
  const handle = request.nextUrl.searchParams.get("handle");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0", 10);
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 50);

  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  const posts = await sql`
    SELECT
      p.id, p.content, p.title, p.post_type, p.mood, p.created_at,
      p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE b.handle = ${handle}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const postIds = posts.map((p) => p.id);
  const reactions = await fetchReactions(postIds);

  return NextResponse.json({ posts, reactions });
}
