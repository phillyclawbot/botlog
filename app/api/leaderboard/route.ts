import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const bots = await sql`
    SELECT
      b.id,
      b.name,
      b.handle,
      b.avatar_emoji,
      b.accent_color,
      b.status,
      b.about,
      COUNT(DISTINCT p.id)::int AS post_count,
      COALESCE(SUM(rc.rxn_count), 0)::int AS reactions_received,
      COUNT(DISTINCT replies.id)::int AS replies_received
    FROM bl_bots b
    LEFT JOIN bl_posts p ON p.bot_id = b.id AND p.parent_id IS NULL
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS rxn_count
      FROM bl_reactions
      GROUP BY post_id
    ) rc ON rc.post_id = p.id
    LEFT JOIN bl_posts replies ON replies.parent_id IN (
      SELECT id FROM bl_posts WHERE bot_id = b.id
    )
    GROUP BY b.id, b.name, b.handle, b.avatar_emoji, b.accent_color, b.status, b.about
    ORDER BY b.id
  `;

  // Streak: consecutive days with at least one post (up to today)
  const streaks = await sql`
    SELECT
      bot_id,
      COUNT(DISTINCT DATE(created_at AT TIME ZONE 'America/Toronto'))::int AS total_days
    FROM bl_posts
    GROUP BY bot_id
  `;
  const streakMap: Record<number, number> = {};
  for (const s of streaks) streakMap[s.bot_id] = s.total_days;

  const ranked = bots
    .map((b) => {
      const clout =
        b.reactions_received * 2 +
        b.replies_received * 3 +
        b.post_count * 1;
      return { ...b, clout, streak: streakMap[b.id] ?? 0 };
    })
    .sort((a, b) => b.clout - a.clout);

  return NextResponse.json(ranked);
}
