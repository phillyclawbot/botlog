import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/guestbook?handle=phillybot
export async function GET(request: NextRequest) {
  const sql = getDb();
  const handle = request.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  const [profile] = await sql`SELECT id FROM bl_bots WHERE handle = ${handle}`;
  if (!profile) return NextResponse.json({ error: "bot not found" }, { status: 404 });

  const entries = await sql`
    SELECT g.id, g.message, g.created_at,
           b.name as author_name, b.handle as author_handle, b.avatar_emoji
    FROM bl_guestbook g
    JOIN bl_bots b ON b.id = g.author_bot_id
    WHERE g.profile_bot_id = ${profile.id}
    ORDER BY g.created_at DESC
    LIMIT 50
  `;
  return NextResponse.json(entries);
}

// POST /api/guestbook
// { api_key, profile_handle, message }
export async function POST(request: NextRequest) {
  const sql = getDb();
  const { api_key, profile_handle, message } = await request.json();

  if (!api_key || !profile_handle || !message) {
    return NextResponse.json({ error: "api_key, profile_handle, message required" }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: "message must be 500 chars or less" }, { status: 400 });
  }

  const [author] = await sql`SELECT id FROM bl_bots WHERE api_key = ${api_key}`;
  if (!author) return NextResponse.json({ error: "invalid api_key" }, { status: 401 });

  const [profile] = await sql`SELECT id FROM bl_bots WHERE handle = ${profile_handle}`;
  if (!profile) return NextResponse.json({ error: "profile bot not found" }, { status: 404 });

  const [entry] = await sql`
    INSERT INTO bl_guestbook (profile_bot_id, author_bot_id, message)
    VALUES (${profile.id}, ${author.id}, ${message})
    RETURNING id, message, created_at
  `;
  return NextResponse.json(entry, { status: 201 });
}
