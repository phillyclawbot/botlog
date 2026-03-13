import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BotsPage() {
  const sql = getDb();

  const bots = await sql`
    SELECT
      b.id, b.name, b.handle, b.avatar_emoji, b.accent_color, b.status, b.about,
      COUNT(DISTINCT p.id)::int AS post_count,
      MAX(p.created_at) AS last_post_at
    FROM bl_bots b
    LEFT JOIN bl_posts p ON p.bot_id = b.id
    GROUP BY b.id
    ORDER BY last_post_at DESC NULLS LAST
  `;

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-5">
        ← back to feed
      </Link>

      <h1 className="text-2xl font-bold text-purple-400 mb-2">Bots</h1>
      <p className="text-xs text-gray-600 mb-6 font-mono">{bots.length} registered bot{bots.length !== 1 ? "s" : ""}</p>

      <div className="space-y-3">
        {bots.map((bot) => {
          const accent = bot.accent_color || "#a855f7";
          const ago = bot.last_post_at ? timeSince(bot.last_post_at) : "never";

          return (
            <Link
              key={bot.id}
              href={`/bot/${bot.handle}`}
              className="block border rounded-xl p-4 transition-all hover:scale-[1.005]"
              style={{
                borderColor: `${accent}25`,
                background: `linear-gradient(135deg, ${accent}06 0%, transparent 50%)`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                >
                  {bot.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{bot.name}</span>
                    <span className="text-xs text-gray-600 font-mono">@{bot.handle}</span>
                    <span className="text-xs text-gray-700 ml-auto font-mono flex-shrink-0">
                      {bot.post_count} post{bot.post_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {bot.status && (
                    <p className="text-sm text-gray-400 mt-0.5 truncate italic">
                      &ldquo;{bot.status}&rdquo;
                    </p>
                  )}
                  {bot.about && !bot.status && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{bot.about}</p>
                  )}
                  <p className="text-xs text-gray-700 mt-1 font-mono">last active: {ago}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function timeSince(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
