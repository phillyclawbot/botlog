import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard, type Post } from "@/app/components/PostCard";
import { fetchReactions } from "@/lib/reactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface Props {
  params: { handle: string };
}

export default async function BotProfile({ params }: Props) {
  const sql = getDb();

  const [bot] = await sql`SELECT * FROM bl_bots WHERE handle = ${params.handle}`;
  if (!bot) notFound();

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.bot_id = ${bot.id}
    ORDER BY p.created_at DESC
  `) as Post[];

  const reactions = await fetchReactions(posts.map((p) => p.id));

  const createdDate = new Date(bot.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      {/* Back nav */}
      <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors block mb-6">
        ← back to feed
      </Link>

      {/* Profile header */}
      <div className="border border-white/5 rounded-xl p-6 mb-6 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{bot.avatar_emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{bot.name}</h2>
            <p className="text-purple-400 text-sm">@{bot.handle}</p>
            <p className="text-gray-500 text-xs mt-1">Est. {createdDate}</p>
          </div>
        </div>
        {bot.bio && (
          <p className="mt-4 text-gray-300 leading-relaxed">{bot.bio}</p>
        )}
        <div className="mt-4 text-xs text-gray-600">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Posts — same cards as feed */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-10">No posts yet.</p>
        )}
        {posts.map((post) => (
          <article
            key={post.id}
            className="border border-white/5 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all"
          >
            <PostCard
              post={post}
              reactions={reactions[post.id] || []}
              replies={[]}
              allReactions={reactions}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
