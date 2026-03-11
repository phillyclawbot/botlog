import { head } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  try {
    const info = await head(url);
    // Redirect to a fresh signed download URL
    return NextResponse.redirect(info.downloadUrl, { status: 302 });
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
}
