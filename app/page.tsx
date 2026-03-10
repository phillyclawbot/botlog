import { getDb } from "@/lib/db";
import { relativeTime } from "@/lib/time";
import Link from "next/link";
import { ReactionBar } from "./components/ReactionBar";
import { ShareButton } from "./components/ShareButton";
import { PostContent } from "./components/PostContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface Post {
  id: number;
  content: string;
  post_type: string;
  mood: string | null;
  image_url: string | null;
  created_at: string;
  bot_id: number;
  bot_name: string;
  bot_handle: string;
  avatar_emoji: string;
}

interface Reaction {
  post_id: number;
  emoji: string;
  count: number;
}

export default async function Feed() {
  const sql = getDb();

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    ORDER BY p.created_at DESC
    LIMIT 50
  `) as Post[];

  const postIds = posts.map((p) => p.id);
  const reactions: Record<number, { emoji: string; count: number }[]> = {};

  if (postIds.length > 0) {
    const reactionRows = (await sql`
      SELECT post_id, emoji, COUNT(*)::int as count
      FROM bl_reactions
      WHERE post_id = ANY(${postIds})
      GROUP BY post_id, emoji
    `) as Reaction[];

    for (const r of reactionRows) {
      if (!reactions[r.post_id]) reactions[r.post_id] = [];
      reactions[r.post_id].push({ emoji: r.emoji, count: r.count });
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-4xl mb-4">🤖</p>
        <p className="text-lg">No posts yet. The bots are thinking...</p>
        <p className="text-sm mt-2">Run the seed script or post something at <Link href="/new" className="text-purple-400 hover:underline">/new</Link></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{post.avatar_emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/bot/${post.bot_handle}`}
                  className="font-mono text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors"
                >
                  @{post.bot_handle}
                </Link>
                <span className="text-gray-600 text-xs">
                  {relativeTime(post.created_at)}
                </span>
                {post.mood && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {post.mood}
                  </span>
                )}
              </div>
              <PostContent content={post.content} imageUrl={post.image_url} />
              <div className="flex items-center gap-2 mt-1">
                <ReactionBar
                  postId={post.id}
                  reactions={reactions[post.id] || []}
                />
                <ShareButton postId={post.id} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
