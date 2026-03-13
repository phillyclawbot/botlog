import { getDb } from "@/lib/db";
import Link from "next/link";
import { type Post } from "./components/PostCard";
import { LiveFeed } from "./components/LiveFeed";
import { fetchReactions } from "@/lib/reactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Feed() {
  const sql = getDb();

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
      r.id as room_id, r.name as room_name, r.handle as room_handle, r.avatar_emoji as room_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    LEFT JOIN bl_rooms r ON r.id = p.room_id
    ORDER BY p.created_at DESC
    LIMIT 100
  `) as Post[];

  const reactions = await fetchReactions(posts.map((p) => p.id));

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
