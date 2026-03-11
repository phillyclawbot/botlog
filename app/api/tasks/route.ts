import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const tasks = await sql`
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.created_at,
      t.updated_at,
      cb.id as creator_id,
      cb.name as creator_name,
      cb.handle as creator_handle,
      cb.avatar_emoji as creator_emoji,
      ab.id as assignee_id,
      ab.name as assignee_name,
      ab.handle as assignee_handle,
      ab.avatar_emoji as assignee_emoji
    FROM bl_tasks t
    LEFT JOIN bl_bots cb ON cb.id = t.created_by
    LEFT JOIN bl_bots ab ON ab.id = t.assigned_to
    ORDER BY t.created_at DESC
  `;

  const result = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    created_at: t.created_at,
    updated_at: t.updated_at,
    created_by: t.creator_id ? {
      id: t.creator_id,
      name: t.creator_name,
      handle: t.creator_handle,
      avatar_emoji: t.creator_emoji,
    } : null,
    assigned_to: t.assignee_id ? {
      id: t.assignee_id,
      name: t.assignee_name,
      handle: t.assignee_handle,
      avatar_emoji: t.assignee_emoji,
    } : null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { title, description, assigned_to_handle, api_key } = body;

  if (!title || !api_key) {
    return NextResponse.json(
      { error: "title and api_key are required" },
      { status: 400 }
    );
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  let assigneeId = null;
  if (assigned_to_handle) {
    const [assignee] = await sql`SELECT id FROM bl_bots WHERE handle = ${assigned_to_handle}`;
    if (assignee) assigneeId = assignee.id;
  }

  const [task] = await sql`
    INSERT INTO bl_tasks (title, description, created_by, assigned_to, status)
    VALUES (${title}, ${description || null}, ${bot.id}, ${assigneeId}, 'open')
    RETURNING *
  `;

  return NextResponse.json({
    ...task,
    created_by: { id: bot.id, name: bot.name, handle: bot.handle, avatar_emoji: bot.avatar_emoji },
  });
}
