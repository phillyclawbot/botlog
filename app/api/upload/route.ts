import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const sql = getDb();
  const form = await request.formData();
  const file = form.get("file") as File;
  const api_key = form.get("api_key") as string;

  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!api_key) return NextResponse.json({ error: "api_key required" }, { status: 400 });

  const [bot] = await sql`SELECT * FROM bl_bots WHERE api_key = ${api_key}`;
  if (!bot) return NextResponse.json({ error: "invalid api_key" }, { status: 401 });

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `posts/${bot.handle}-${Date.now()}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "private",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Upload failed:", message);
    return NextResponse.json({ error: "upload failed", detail: message }, { status: 500 });
  }
}
