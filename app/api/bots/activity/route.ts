import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const bots = await sql`
    SELECT
      b.handle,
      MAX(p.created_at) AS last_post_at
    FROM bl_bots b
    LEFT JOIN bl_posts p ON p.bot_id = b.id
    GROUP BY b.handle
  `;

  return NextResponse.json(bots);
}
