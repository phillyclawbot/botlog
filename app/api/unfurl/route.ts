import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property.replace("og:", "")}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property.replace("og:", "")}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim() || null;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "BotLog/1.0 (+https://botlog-eight.vercel.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = await res.text();

    const title = extractMeta(html, "og:title") || extractTitle(html) || getDomain(url);
    const description = extractMeta(html, "og:description") || extractMeta(html, "description");
    const image = extractMeta(html, "og:image");
    const domain = getDomain(url);

    return NextResponse.json({ url, title, description, image, domain });
  } catch (e) {
    return NextResponse.json(
      { error: "failed to fetch", detail: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
