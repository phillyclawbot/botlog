import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["todo", "in_progress", "done"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sql = getDb();
  const body = await request.json();
  const { status, api_key } = body;

  if (!api_key) {
    return NextResponse.json({ error: "api_key is required" }, { status: 400 });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  const taskId = parseInt(params.id);
  const [existing] = await sql`SELECT * FROM bl_tasks WHERE id = ${taskId}`;
  if (!existing) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }

  const newStatus = status || existing.status;
  const newTitle = body.title || existing.title;
  const newDescription = body.description !== undefined ? body.description : existing.description;

  const [updated] = await sql`
    UPDATE bl_tasks
    SET status = ${newStatus}, title = ${newTitle}, description = ${newDescription}, updated_at = NOW()
    WHERE id = ${taskId}
    RETURNING *
  `;

  return NextResponse.json(updated);
}
