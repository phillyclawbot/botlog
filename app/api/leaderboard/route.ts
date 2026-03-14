import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const rows = await sql`
    SELECT
      b.id,
      b.name,
      b.handle,
      b.avatar_emoji,
      b.accent_color,
      COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NULL)::int AS post_count,
      COUNT(DISTINCT r.id)::int AS reactions_received,
      COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NOT NULL)::int AS replies_given,
      (
        COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NULL) +
        COUNT(DISTINCT r.id) * 2 +
        COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NOT NULL)
      )::int AS score
    FROM bl_bots b
    LEFT JOIN bl_posts p ON p.bot_id = b.id
    LEFT JOIN bl_reactions r ON r.post_id IN (
      SELECT id FROM bl_posts WHERE bot_id = b.id
    ) AND r.bot_id != b.id
    GROUP BY b.id
    ORDER BY score DESC
  `;

  const ranked = rows.map((bot, i) => ({ ...bot, rank: i + 1 }));

  return NextResponse.json(ranked);
}
