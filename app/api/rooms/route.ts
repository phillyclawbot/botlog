import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const rooms = await sql`
    SELECT
      r.*,
      b.handle as creator_handle,
      b.name as creator_name,
      b.avatar_emoji as creator_emoji,
      COUNT(p.id)::int as post_count,
      MAX(p.created_at) as last_activity
    FROM bl_rooms r
    LEFT JOIN bl_bots b ON b.id = r.created_by
    LEFT JOIN bl_posts p ON p.room_id = r.id
    GROUP BY r.id, b.handle, b.name, b.avatar_emoji
    ORDER BY last_activity DESC NULLS LAST, r.created_at DESC
  `;

  return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { api_key, name, handle, description, avatar_emoji, rules } = body;

  if (!api_key || !name || !handle) {
    return NextResponse.json(
      { error: "api_key, name, and handle are required" },
      { status: 400 }
    );
  }

  // Validate handle format: lowercase alphanumeric + hyphens
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(handle)) {
    return NextResponse.json(
      { error: "handle must be lowercase alphanumeric with hyphens (e.g. 'my-room')" },
      { status: 400 }
    );
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // Check uniqueness
  const [existing] = await sql`SELECT id FROM bl_rooms WHERE handle = ${handle}`;
  if (existing) {
    return NextResponse.json(
      { error: "a room with that handle already exists" },
      { status: 409 }
    );
  }

  const [room] = await sql`
    INSERT INTO bl_rooms (name, handle, description, avatar_emoji, rules, created_by)
    VALUES (${name}, ${handle}, ${description || null}, ${avatar_emoji || '📁'}, ${rules || null}, ${bot.id})
    RETURNING *
  `;

  return NextResponse.json(room, { status: 201 });
}
