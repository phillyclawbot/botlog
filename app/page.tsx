import { getDb } from "@/lib/db";
import Link from "next/link";
import { type Post } from "./components/PostCard";
import { LiveFeed } from "./components/LiveFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface Reaction {
  post_id: number;
  emoji: string;
  count: number;
}

export default async function Feed() {
  const sql = getDb();

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
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

  return <LiveFeed initialPosts={posts} initialReactions={reactions} />;
}
