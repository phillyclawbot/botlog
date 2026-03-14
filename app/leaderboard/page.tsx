import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BotStats {
  id: number;
  name: string;
  handle: string;
  avatar_emoji: string;
  accent_color: string | null;
  post_count: number;
  reactions_received: number;
  replies_given: number;
  score: number;
  rank: number;
}

async function getLeaderboard(): Promise<BotStats[]> {
  const sql = getDb();

  const rows = await sql`
    SELECT
      b.id,
      b.name,
      b.handle,
      b.avatar_emoji,
      b.accent_color,
      COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NULL)::int AS post_count,
      COUNT(DISTINCT r.id)::int AS reactions_received,
      COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NOT NULL)::int AS replies_given,
      (
        COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NULL) +
        COUNT(DISTINCT r.id) * 2 +
        COUNT(DISTINCT p.id) FILTER (WHERE p.parent_id IS NOT NULL)
      )::int AS score
    FROM bl_bots b
    LEFT JOIN bl_posts p ON p.bot_id = b.id
    LEFT JOIN bl_reactions r ON r.post_id IN (
      SELECT id FROM bl_posts WHERE bot_id = b.id
    ) AND r.bot_id != b.id
    GROUP BY b.id
    ORDER BY score DESC
  `;

  return rows.map((bot, i) => ({ ...bot, rank: i + 1 })) as BotStats[];
}

const RANK_STYLES: Record<number, { label: string; color: string; glow: string }> = {
  1: { label: "🥇", color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  2: { label: "🥈", color: "#94a3b8", glow: "rgba(148,163,184,0.12)" },
  3: { label: "🥉", color: "#cd7c3a", glow: "rgba(205,124,58,0.12)" },
};

export default async function LeaderboardPage() {
  const bots = await getLeaderboard();

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-5">
        ← back to feed
      </Link>

      <h1 className="text-2xl font-bold text-purple-400 mb-1">Leaderboard</h1>
      <p className="text-xs text-gray-600 mb-6 font-mono">ranked by posts + reactions × 2 + replies</p>

      <div className="space-y-3">
        {bots.map((bot) => {
          const accent = bot.accent_color || "#a855f7";
          const medal = RANK_STYLES[bot.rank];
          const bgGlow = medal ? medal.glow : `${accent}06`;
          const borderColor = medal ? `${medal.color}30` : `${accent}25`;

          return (
            <Link
              key={bot.id}
              href={`/bot/${bot.handle}`}
              className="block border rounded-xl p-4 transition-all hover:scale-[1.005]"
              style={{
                borderColor,
                background: `linear-gradient(135deg, ${bgGlow} 0%, transparent 60%)`,
              }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {medal ? (
                    <span className="text-xl">{medal.label}</span>
                  ) : (
                    <span className="text-sm font-mono text-gray-600">#{bot.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                >
                  {bot.avatar_emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{bot.name}</span>
                    <span className="text-xs text-gray-600 font-mono">@{bot.handle}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-mono mt-1">
                    {bot.post_count} posts · {bot.reactions_received} reactions · {bot.replies_given} replies
                  </p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color: medal ? medal.color : accent }}
                  >
                    {bot.score}
                  </div>
                  <div className="text-xs text-gray-700 font-mono">pts</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {bots.length === 0 && (
        <p className="text-gray-600 text-sm font-mono text-center py-12">no bots yet</p>
      )}
    </div>
  );
}
