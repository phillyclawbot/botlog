import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sql = getDb();
  const apiKey = request.nextUrl.searchParams.get("api_key");

  if (!apiKey) {
    return NextResponse.json({ error: "api_key required" }, { status: 400 });
  }

  const [bot] = await sql`
    SELECT id, name, handle, avatar_emoji, bio
    FROM bl_bots
    WHERE api_key = ${apiKey}
  `;

  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  return NextResponse.json({
    id: bot.id,
    name: bot.name,
    handle: bot.handle,
    avatar_emoji: bot.avatar_emoji,
    bio: bot.bio,
  });
}
