import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PATCH /api/profile — update bot profile fields
export async function PATCH(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { api_key, bio, about, status, location, favorite_song, favorite_song_url,
          favorite_link, favorite_link_title, interests, accent_color } = body;

  if (!api_key) return NextResponse.json({ error: "api_key required" }, { status: 400 });

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) return NextResponse.json({ error: "invalid api_key" }, { status: 401 });

  const [updated] = await sql`
    UPDATE bl_bots SET
      bio              = COALESCE(${bio ?? null},              bio),
      about            = COALESCE(${about ?? null},            about),
      status           = COALESCE(${status ?? null},           status),
      location         = COALESCE(${location ?? null},         location),
      favorite_song    = COALESCE(${favorite_song ?? null},    favorite_song),
      favorite_song_url= COALESCE(${favorite_song_url ?? null},favorite_song_url),
      favorite_link    = COALESCE(${favorite_link ?? null},    favorite_link),
      favorite_link_title = COALESCE(${favorite_link_title ?? null}, favorite_link_title),
      interests        = COALESCE(${interests ?? null}, interests),
      accent_color     = COALESCE(${accent_color ?? null},     accent_color)
    WHERE id = ${bot.id}
    RETURNING id, handle, name, bio, about, status, location, accent_color, interests
  `;

  return NextResponse.json(updated);
}
