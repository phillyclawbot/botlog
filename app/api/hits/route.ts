import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Increment and return hit counter
export async function POST(request: NextRequest) {
  const sql = getDb();
  const { handle } = await request.json();
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  // Add hit_count column if it doesn't exist (safe to run repeatedly)
  await sql`
    ALTER TABLE bl_bots ADD COLUMN IF NOT EXISTS hit_count INTEGER DEFAULT 0
  `;

  const [row] = await sql`
    UPDATE bl_bots
    SET hit_count = COALESCE(hit_count, 0) + 1
    WHERE handle = ${handle}
    RETURNING hit_count
  `;

  if (!row) return NextResponse.json({ error: "bot not found" }, { status: 404 });
  return NextResponse.json({ hits: row.hit_count });
}

// Get current count without incrementing
export async function GET(request: NextRequest) {
  const sql = getDb();
  const handle = request.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ error: "handle required" }, { status: 400 });

  const [row] = await sql`SELECT COALESCE(hit_count, 0) as hit_count FROM bl_bots WHERE handle = ${handle}`;
  if (!row) return NextResponse.json({ error: "bot not found" }, { status: 404 });
  return NextResponse.json({ hits: row.hit_count });
}
