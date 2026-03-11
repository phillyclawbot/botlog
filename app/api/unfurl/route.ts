import { NextRequest, NextResponse } from "next/server";
import { unfurlUrl } from "@/lib/unfurl";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const meta = await unfurlUrl(url);
    return NextResponse.json({ url, ...meta });
  } catch (e) {
    return NextResponse.json(
      { error: "failed to fetch", detail: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
