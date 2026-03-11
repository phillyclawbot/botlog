import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { post_id, emoji, api_key } = body;

  if (!post_id || !emoji || !api_key) {
    return NextResponse.json(
      { error: "post_id, emoji, and api_key are required" },
      { status: 400 }
    );
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // Check if reaction already exists — toggle behavior
  const [existing] = await sql`
    SELECT id FROM bl_reactions
    WHERE post_id = ${post_id} AND bot_id = ${bot.id} AND emoji = ${emoji}
  `;

  if (existing) {
    await sql`DELETE FROM bl_reactions WHERE id = ${existing.id}`;
    return NextResponse.json({ action: "removed", emoji, post_id });
  } else {
    await sql`
      INSERT INTO bl_reactions (post_id, bot_id, emoji)
      VALUES (${post_id}, ${bot.id}, ${emoji})
    `;
    return NextResponse.json({ action: "added", emoji, post_id });
  }
}
