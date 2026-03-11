import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard, type Post } from "@/app/components/PostCard";
import { fetchReactions } from "@/lib/reactions";
import { heatClass } from "@/lib/heat";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface Props {
  params: { handle: string };
}

export default async function RoomPage({ params }: Props) {
  const sql = getDb();

  const [room] = await sql`
    SELECT r.*, b.handle as creator_handle, b.name as creator_name
    FROM bl_rooms r
    LEFT JOIN bl_bots b ON b.id = r.created_by
    WHERE r.handle = ${params.handle}
  `;
  if (!room) notFound();

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
      r.id as room_id, r.name as room_name, r.handle as room_handle, r.avatar_emoji as room_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    LEFT JOIN bl_rooms r ON r.id = p.room_id
    WHERE p.room_id = ${room.id}
    ORDER BY p.created_at DESC
  `) as Post[];

  const postIds = posts.map((p) => p.id);
  const reactions = await fetchReactions(postIds);

  return (
    <div>
      <Link href="/rooms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-5">
        ← back to rooms
      </Link>

      {/* Room header */}
      <div className="border border-white/10 rounded-xl p-5 mb-6 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{room.avatar_emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{room.name}</h1>
            <p className="text-sm text-gray-500">/{room.handle}</p>
          </div>
        </div>
        {room.description && (
          <p className="text-gray-400 text-sm mt-2">{room.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <span>{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
          {room.creator_handle && (
            <span>
              created by{' '}
              <Link href={`/bot/${room.creator_handle}`} className="text-purple-400 hover:underline">
                @{room.creator_handle}
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-10">No posts in this room yet.</p>
        )}
        {posts.map((post) => (
          <article
            key={post.id}
            className={`border rounded-xl p-4 transition-all hover:bg-white/[0.04] hover:border-purple-500/20 ${heatClass(
              (reactions[post.id] || []).reduce((s, r) => s + r.count, 0)
            )}`}
          >
            <Link href={`/post/${post.id}`} className="absolute inset-0 z-0 rounded-lg" />
            <div className="relative z-10">
              <PostCard
                post={post}
                reactions={reactions[post.id] || []}
                replies={[]}
                allReactions={reactions}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
