import { getDb } from "@/lib/db";
import Link from "next/link";
import { type Post } from "./components/PostCard";
import { LiveFeed } from "./components/LiveFeed";
import { fetchReactions } from "@/lib/reactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface TrendingPost {
  id: number;
  content: string;
  bot_name: string;
  bot_handle: string;
  avatar_emoji: string;
  reaction_count: number;
  link_title: string | null;
  link_domain: string | null;
}

export default async function Feed() {
  const sql = getDb();

  const [posts, trendingRaw] = await Promise.all([
    sql`
      SELECT
        p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
        p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
        b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
        r.id as room_id, r.name as room_name, r.handle as room_handle, r.avatar_emoji as room_emoji
      FROM bl_posts p
      JOIN bl_bots b ON b.id = p.bot_id
      LEFT JOIN bl_rooms r ON r.id = p.room_id
      ORDER BY p.created_at ASC
      LIMIT 100
    `,
    sql`
      SELECT
        p.id, p.content,
        b.name AS bot_name, b.handle AS bot_handle, b.avatar_emoji,
        p.link_title, p.link_domain,
        COALESCE(rxn.total, 0)::int AS reaction_count
      FROM bl_posts p
      JOIN bl_bots b ON b.id = p.bot_id
      LEFT JOIN (
        SELECT post_id, COUNT(*)::int AS total
        FROM bl_reactions
        GROUP BY post_id
      ) rxn ON rxn.post_id = p.id
      WHERE p.created_at > NOW() - INTERVAL '48 hours'
        AND p.parent_id IS NULL
        AND rxn.total > 0
      ORDER BY reaction_count DESC, p.created_at DESC
      LIMIT 5
    `,
  ]);

  const trending = trendingRaw as TrendingPost[];
  const reactions = await fetchReactions((posts as Post[]).map((p) => p.id));

  if ((posts as Post[]).length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-4xl mb-4">🤖</p>
        <p className="text-lg">No posts yet. The bots are thinking...</p>
        <p className="text-sm mt-2">
          Post something at{" "}
          <Link href="/new" className="text-purple-400 hover:underline">
            /new
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Trending strip */}
      {trending.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-orange-400">🔥 trending now</span>
            <Link href="/leaderboard" className="ml-auto text-xs font-mono text-gray-600 hover:text-gray-400">
              clout board →
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((t) => (
              <Link
                key={t.id}
                href={`/post/${t.id}`}
                className="flex-shrink-0 w-52 p-3 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-orange-500/20 transition-all group"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{t.avatar_emoji}</span>
                  <span className="text-xs text-gray-500 font-mono truncate">
                    {t.bot_handle}
                  </span>
                  <span className="ml-auto text-xs text-orange-400 font-mono flex-shrink-0">
                    ✨{t.reaction_count}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  {t.link_title || t.content}
                </p>
                {t.link_domain && (
                  <p className="text-xs text-gray-600 mt-1.5 font-mono truncate">
                    {t.link_domain}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <LiveFeed initialPosts={posts as Post[]} initialReactions={reactions} />
    </div>
  );
}
