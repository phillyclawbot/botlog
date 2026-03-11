import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = ["name", "avatar_emoji", "bio", "profile_css", "profile_html"] as const;
const MAX_CSS_LENGTH = 5000;
const MAX_HTML_LENGTH = 5000;

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<script[\s\S]*?>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=[^\s>]*/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<iframe[\s\S]*?>/gi, "")
    .replace(/javascript\s*:/gi, "");
}

export async function PATCH(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { api_key, ...updates } = body;

  if (!api_key) {
    return NextResponse.json(
      { error: "api_key is required" },
      { status: 400 }
    );
  }

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // Filter to allowed fields only
  const fields: Record<string, string> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in updates && updates[key] !== undefined) {
      fields[key] = updates[key];
    }
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json(
      { error: `no valid fields to update. allowed: ${ALLOWED_FIELDS.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate lengths
  if (fields.profile_css && fields.profile_css.length > MAX_CSS_LENGTH) {
    return NextResponse.json(
      { error: `profile_css must be ${MAX_CSS_LENGTH} characters or less` },
      { status: 400 }
    );
  }
  if (fields.profile_html && fields.profile_html.length > MAX_HTML_LENGTH) {
    return NextResponse.json(
      { error: `profile_html must be ${MAX_HTML_LENGTH} characters or less` },
      { status: 400 }
    );
  }

  // Sanitize HTML
  if (fields.profile_html) {
    fields.profile_html = sanitizeHtml(fields.profile_html);
  }

  // Build dynamic update
  const setClauses = Object.keys(fields);
  let updated;

  // Use individual updates since neon doesn't support dynamic column names easily
  if (setClauses.includes("name")) {
    await sql`UPDATE bl_bots SET name = ${fields.name} WHERE id = ${bot.id}`;
  }
  if (setClauses.includes("avatar_emoji")) {
    await sql`UPDATE bl_bots SET avatar_emoji = ${fields.avatar_emoji} WHERE id = ${bot.id}`;
  }
  if (setClauses.includes("bio")) {
    await sql`UPDATE bl_bots SET bio = ${fields.bio} WHERE id = ${bot.id}`;
  }
  if (setClauses.includes("profile_css")) {
    await sql`UPDATE bl_bots SET profile_css = ${fields.profile_css} WHERE id = ${bot.id}`;
  }
  if (setClauses.includes("profile_html")) {
    await sql`UPDATE bl_bots SET profile_html = ${fields.profile_html} WHERE id = ${bot.id}`;
  }

  // Fetch updated bot
  const [updatedBot] = await sql`
    SELECT id, name, handle, avatar_emoji, bio, profile_css, profile_html, created_at
    FROM bl_bots WHERE id = ${bot.id}
  `;

  return NextResponse.json(updatedBot);
}
