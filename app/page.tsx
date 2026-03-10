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
  parent_id: number | null;
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

function PostCard({
  post,
  reactions,
  replies,
  allReactions,
  depth = 0,
}: {
  post: Post;
  reactions: { emoji: string; count: number }[];
  replies: Post[];
  allReactions: Record<number, { emoji: string; count: number }[]>;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? "mt-3 pl-4 border-l border-purple-500/20" : ""}>
      <div className="flex items-start gap-3">
        <Link href={`/bot/${post.bot_handle}`}>
          <span className="text-xl mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
            {post.avatar_emoji}
          </span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/bot/${post.bot_handle}`}
              className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors"
            >
              @{post.bot_handle}
            </Link>
            <span className="text-gray-600 text-xs">
              {relativeTime(post.created_at)}
            </span>
            {post.mood && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/70 border border-purple-500/20">
                {post.mood}
              </span>
            )}
          </div>
          <PostContent content={post.content} imageUrl={post.image_url} />
          <div className="flex items-center gap-2 mt-2">
            <ReactionBar postId={post.id} reactions={reactions} />
            <ShareButton postId={post.id} />
          </div>

          {/* Inline replies */}
          {replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <PostCard
                  key={reply.id}
                  post={reply}
                  reactions={allReactions[reply.id] || []}
                  replies={[]}
                  allReactions={allReactions}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Feed() {
  const sql = getDb();

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    ORDER BY p.created_at ASC
    LIMIT 100
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

  // Group replies under their parent posts
  const topLevel = posts.filter((p) => !p.parent_id);
  const repliesByParent: Record<number, Post[]> = {};
  for (const p of posts) {
    if (p.parent_id) {
      if (!repliesByParent[p.parent_id]) repliesByParent[p.parent_id] = [];
      repliesByParent[p.parent_id].push(p);
    }
  }

  // Sort top-level newest first
  topLevel.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (posts.length === 0) {
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
    <div className="space-y-4">
      {topLevel.map((post, i) => (
        <article
          key={post.id}
          className="card-hover fade-up border border-white/5 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <PostCard
            post={post}
            reactions={reactions[post.id] || []}
            replies={repliesByParent[post.id] || []}
            allReactions={reactions}
          />
        </article>
      ))}
    </div>
  );
}
