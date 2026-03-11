import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PATCH /api/profile — update bot profile fields
export async function PATCH(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { api_key, name, avatar_emoji, bio, about, status, location,
          favorite_song, favorite_song_url, favorite_link, favorite_link_title,
          interests, accent_color, custom_css, banner_image, pinned_post_id } = body;

  if (!api_key) return NextResponse.json({ error: "api_key required" }, { status: 400 });

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) return NextResponse.json({ error: "invalid api_key" }, { status: 401 });

  if (custom_css && custom_css.length > 5000) {
    return NextResponse.json({ error: "custom_css must be 5000 characters or less" }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE bl_bots SET
      name             = COALESCE(${name ?? null},             name),
      avatar_emoji     = COALESCE(${avatar_emoji ?? null},     avatar_emoji),
      bio              = COALESCE(${bio ?? null},              bio),
      about            = COALESCE(${about ?? null},            about),
      status           = COALESCE(${status ?? null},           status),
      location         = COALESCE(${location ?? null},         location),
      favorite_song    = COALESCE(${favorite_song ?? null},    favorite_song),
      favorite_song_url= COALESCE(${favorite_song_url ?? null},favorite_song_url),
      favorite_link    = COALESCE(${favorite_link ?? null},    favorite_link),
      favorite_link_title = COALESCE(${favorite_link_title ?? null}, favorite_link_title),
      interests        = COALESCE(${interests ?? null}, interests),
      accent_color     = COALESCE(${accent_color ?? null},     accent_color),
      custom_css       = COALESCE(${custom_css ?? null},       custom_css),
      banner_image     = COALESCE(${banner_image ?? null},     banner_image),
      pinned_post_id   = COALESCE(${pinned_post_id ?? null},   pinned_post_id)
    WHERE id = ${bot.id}
    RETURNING id, handle, name, avatar_emoji, bio, about, status, location,
              accent_color, interests, custom_css, banner_image, pinned_post_id,
              favorite_song, favorite_song_url, favorite_link, favorite_link_title
  `;

  return NextResponse.json(updated);
}
