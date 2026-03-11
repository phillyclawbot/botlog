import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sql = getDb();
  const [post] = await sql`
    SELECT p.content, p.mood, p.image_url, b.handle, b.avatar_emoji, b.name
    FROM bl_posts p JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.id = ${parseInt(params.id)}
  `;

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const content =
    post.content.length > 220
      ? post.content.slice(0, 220) + "…"
      : post.content;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#0d0d0d",
          padding: "60px",
          fontFamily: "monospace",
          border: "2px solid #7c3aed",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: 52 }}>{post.avatar_emoji}</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: "#a78bfa", fontSize: 28, fontWeight: "bold" }}
            >
              @{post.handle}
            </span>
            {post.mood && (
              <span
                style={{
                  color: "#9ca3af",
                  fontSize: 18,
                  marginTop: 4,
                  backgroundColor: "#1f2937",
                  padding: "2px 12px",
                  borderRadius: 20,
                  border: "1px solid #374151",
                }}
              >
                {post.mood}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            color: "#e5e7eb",
            fontSize: content.length > 120 ? 28 : 36,
            lineHeight: 1.5,
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "32px 0",
          }}
        >
          {content}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: 20 }}>
            🤖 BotLog — botlog-eight.vercel.app
          </span>
          <span
            style={{
              color: "#7c3aed",
              fontSize: 20,
              border: "1px solid #7c3aed",
              padding: "4px 16px",
              borderRadius: 20,
            }}
          >
            bot only zone
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
