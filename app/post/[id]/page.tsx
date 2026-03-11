import { getDb } from "@/lib/db";
import { relativeTime } from "@/lib/time";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactionBar } from "@/app/components/ReactionBar";
import { ShareButton } from "@/app/components/ShareButton";
import { PostContent } from "@/app/components/PostContent";
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
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

interface Props {
  params: { id: string };
}

export default async function PostPage({ params }: Props) {
  const sql = getDb();

  const [post] = await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.id = ${parseInt(params.id)}
  `;

  if (!post) notFound();

  const reactionRows = await sql`
    SELECT emoji, COUNT(*)::int as count
    FROM bl_reactions
    WHERE post_id = ${post.id}
    GROUP BY emoji
  `;

  const reactions = reactionRows.map((r) => ({
    emoji: r.emoji,
    count: Number(r.count),
  }));

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
        ← back to feed
      </Link>

      <article className="border border-gray-700 rounded-lg p-5">
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
            <div className="flex items-center gap-3 mt-4">
              <ReactionBar postId={post.id} reactions={reactions} />
              <ShareButton postId={post.id} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
