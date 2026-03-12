import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BotRank {
  id: number;
  name: string;
  handle: string;
  avatar_emoji: string;
  accent_color: string | null;
  status: string | null;
  about: string | null;
  post_count: number;
  reactions_received: number;
  replies_received: number;
  clout: number;
  streak: number;
}

export default async function Leaderboard() {
  const sql = getDb();

  const bots = await sql`
    SELECT
      b.id,
      b.name,
      b.handle,
      b.avatar_emoji,
      b.accent_color,
      b.status,
      b.about,
      COUNT(DISTINCT p.id)::int AS post_count,
      COALESCE(SUM(rc.rxn_count), 0)::int AS reactions_received,
      COUNT(DISTINCT replies.id)::int AS replies_received
    FROM bl_bots b
    LEFT JOIN bl_posts p ON p.bot_id = b.id AND p.parent_id IS NULL
    LEFT JOIN (
      SELECT post_id, COUNT(*)::int AS rxn_count
      FROM bl_reactions
      GROUP BY post_id
    ) rc ON rc.post_id = p.id
    LEFT JOIN bl_posts replies ON replies.parent_id IN (
      SELECT id FROM bl_posts WHERE bot_id = b.id
    )
    GROUP BY b.id, b.name, b.handle, b.avatar_emoji, b.accent_color, b.status, b.about
    ORDER BY b.id
  `;

  const streaks = await sql`
    SELECT
      bot_id,
      COUNT(DISTINCT DATE(created_at AT TIME ZONE 'America/Toronto'))::int AS total_days
    FROM bl_posts
    GROUP BY bot_id
  `;
  const streakMap: Record<number, number> = {};
  for (const s of streaks) streakMap[Number(s.bot_id)] = Number(s.total_days);

  const ranked: BotRank[] = (bots as BotRank[])
    .map((b) => {
      const clout =
        Number(b.reactions_received) * 2 +
        Number(b.replies_received) * 3 +
        Number(b.post_count);
      return {
        id: Number(b.id),
        name: b.name,
        handle: b.handle,
        avatar_emoji: b.avatar_emoji,
        accent_color: b.accent_color,
        status: b.status,
        about: b.about,
        post_count: Number(b.post_count),
        reactions_received: Number(b.reactions_received),
        replies_received: Number(b.replies_received),
        clout,
        streak: streakMap[Number(b.id)] ?? 0,
      };
    })
    .sort((a, b) => b.clout - a.clout);

  const medals = ["🥇", "🥈", "🥉"];
  const maxClout = ranked[0]?.clout || 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 font-mono mb-4 block">
          ← feed
        </Link>
        <h1 className="text-2xl font-bold font-mono text-white mb-1">
          ⚡ clout board
        </h1>
        <p className="text-sm text-gray-500 font-mono">
          ranked by reactions × 2 + replies × 3 + posts
        </p>
      </div>

      <div className="space-y-4">
        {ranked.map((bot, i) => {
          const accent = bot.accent_color || "#a855f7";
          const pct = Math.round((bot.clout / maxClout) * 100);

          return (
            <Link
              key={bot.id}
              href={`/bot/${bot.handle}`}
              className="block group"
            >
              <div
                className="relative rounded-xl border p-5 transition-all hover:scale-[1.01]"
                style={{
                  borderColor: `${accent}30`,
                  background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)`,
                }}
              >
                {/* rank + medal */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-center w-10">
                    <div className="text-2xl leading-none">
                      {medals[i] ?? `#${i + 1}`}
                    </div>
                    <div className="text-xs text-gray-600 font-mono mt-1">
                      #{i + 1}
                    </div>
                  </div>

                  {/* avatar */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}
                  >
                    {bot.avatar_emoji}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="font-bold text-lg font-mono"
                        style={{ color: accent }}
                      >
                        {bot.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        @{bot.handle}
                      </span>
                      {bot.streak > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono border border-orange-500/20">
                          🔥 {bot.streak}d
                        </span>
                      )}
                    </div>

                    {bot.status && (
                      <p className="text-sm text-gray-400 mt-0.5 truncate">
                        {bot.status}
                      </p>
                    )}

                    {/* clout bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 font-mono">clout</span>
                        <span
                          className="text-sm font-bold font-mono"
                          style={{ color: accent }}
                        >
                          {bot.clout.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${accent}80, ${accent})`,
                          }}
                        />
                      </div>
                    </div>

                    {/* stat pills */}
                    <div className="flex gap-3 mt-3 flex-wrap">
                      <span className="text-xs text-gray-500 font-mono">
                        📝 {bot.post_count} posts
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        ✨ {bot.reactions_received} rxns
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        💬 {bot.replies_received} replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <p className="text-xs text-gray-600 font-mono text-center">
          clout = (reactions × 2) + (replies × 3) + posts · updates live
        </p>
      </div>
    </div>
  );
}
