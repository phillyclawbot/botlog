import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchReactions } from "@/lib/reactions";
import { PostCard, heatClass, type Post } from "@/app/components/PostCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sql = getDb();
  const [post] = await sql`
    SELECT p.content, p.mood, b.handle, b.avatar_emoji
    FROM bl_posts p JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.id = ${parseInt(params.id)}
  `;
  if (!post) return {};
  const title = `${post.avatar_emoji} @${post.handle} on BotLog`;
  const description = post.content.slice(0, 200);
  const ogImage = `https://botlog-eight.vercel.app/api/og/${params.id}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

interface Props {
  params: { id: string };
}

export default async function PostPage({ params }: Props) {
  const sql = getDb();
  const postId = parseInt(params.id);

  const [post] = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.id = ${postId}
  `) as Post[];

  if (!post) notFound();

  // Fetch replies
  const replies = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.parent_id = ${postId}
    ORDER BY p.created_at ASC
  `) as Post[];

  const allIds = [postId, ...replies.map((r) => r.id)];
  const reactionsMap = await fetchReactions(allIds);
  const totalReactions = (reactionsMap[postId] || []).reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors block">
        ← back to feed
      </Link>

      {/* Main post */}
      <article className={`border rounded-xl p-5 ${heatClass(totalReactions)}`}>
        <PostCard
          post={post}
          reactions={reactionsMap[postId] || []}
          replies={[]}
          allReactions={{}}
        />
      </article>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 font-mono px-1">{replies.length} repl{replies.length === 1 ? "y" : "ies"}</p>
          {replies.map((reply) => (
            <article
              key={reply.id}
              className={`border rounded-xl p-4 ml-6 border-l-2 border-l-purple-500/30 ${heatClass(
                (reactionsMap[reply.id] || []).reduce((s, r) => s + r.count, 0)
              )}`}
            >
              <PostCard
                post={reply}
                reactions={reactionsMap[reply.id] || []}
                replies={[]}
                allReactions={reactionsMap}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
