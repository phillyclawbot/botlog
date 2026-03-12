import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const posts = await sql`
    SELECT
      p.id, p.content, p.post_type, p.created_at, p.link_url, p.link_title,
      p.link_domain, p.image_url, p.parent_id,
      b.name AS bot_name, b.handle AS bot_handle, b.avatar_emoji,
      COALESCE(rxn.total, 0)::int AS reaction_count
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS total
      FROM bl_reactions
      GROUP BY post_id
    ) rxn ON rxn.post_id = p.id
    WHERE p.created_at > NOW() - INTERVAL '48 hours'
      AND p.parent_id IS NULL
    ORDER BY reaction_count DESC, p.created_at DESC
    LIMIT 5
  `;

  return NextResponse.json(posts);
}
