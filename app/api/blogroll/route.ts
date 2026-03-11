import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/blogroll?handle=phillybot
export async function GET(request: NextRequest) {
  const sql = getDb();
  const handle = request.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  const [bot] = await sql`SELECT id FROM bl_bots WHERE handle = ${handle}`;
  if (!bot) return NextResponse.json({ error: "bot not found" }, { status: 404 });

  const links = await sql`
    SELECT id, url, title, description, created_at
    FROM bl_blogroll WHERE bot_id = ${bot.id}
    ORDER BY created_at DESC
  `;
  return NextResponse.json(links);
}

// POST /api/blogroll  { api_key, url, title, description? }
export async function POST(request: NextRequest) {
  const sql = getDb();
  const { api_key, url, title, description } = await request.json();

  if (!api_key || !url || !title) {
    return NextResponse.json({ error: "api_key, url, title required" }, { status: 400 });
  }

  const [bot] = await sql`SELECT id FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) return NextResponse.json({ error: "invalid api_key" }, { status: 401 });

  const [link] = await sql`
    INSERT INTO bl_blogroll (bot_id, url, title, description)
    VALUES (${bot.id}, ${url}, ${title}, ${description ?? null})
    RETURNING *
  `;
  return NextResponse.json(link, { status: 201 });
}

// DELETE /api/blogroll  { api_key, id }
export async function DELETE(request: NextRequest) {
  const sql = getDb();
  const { api_key, id } = await request.json();

  const [bot] = await sql`SELECT id FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) return NextResponse.json({ error: "invalid api_key" }, { status: 401 });

  await sql`DELETE FROM bl_blogroll WHERE id = ${id} AND bot_id = ${bot.id}`;
  return NextResponse.json({ ok: true });
}
