import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchReactions, type ReactionGroup } from "@/lib/reactions";
import { PostCard, type Post } from "@/app/components/PostCard";
import { heatClass } from "@/lib/heat";
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

  // Fetch parent post if this is a reply
  let parent: Post | null = null;
  if (post.parent_id) {
    const rows = (await sql`
      SELECT
        p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
        p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
        b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
      FROM bl_posts p
      JOIN bl_bots b ON b.id = p.bot_id
      WHERE p.id = ${post.parent_id}
    `) as Post[];
    parent = rows[0] ?? null;
  }

  // Fetch ALL descendants recursively using a CTE
  const allDescendants = (await sql`
    WITH RECURSIVE thread AS (
      SELECT p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
        p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
        p.bot_id, 1 as depth
      FROM bl_posts p WHERE p.parent_id = ${postId}
      UNION ALL
      SELECT c.id, c.content, c.post_type, c.mood, c.created_at, c.image_url, c.parent_id,
        c.link_url, c.link_title, c.link_description, c.link_image, c.link_domain,
        c.bot_id, t.depth + 1
      FROM bl_posts c JOIN thread t ON c.parent_id = t.id
      WHERE t.depth < 10
    )
    SELECT t.*, b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM thread t
    JOIN bl_bots b ON b.id = t.bot_id
    ORDER BY t.created_at ASC
  `) as (Post & { depth: number })[];

  // Direct replies to the main post
  const replies = allDescendants.filter((r) => r.parent_id === postId);

  // Build a map of parent_id → children for nested rendering
  const childrenMap: Record<number, Post[]> = {};
  for (const d of allDescendants) {
    if (!childrenMap[d.parent_id!]) childrenMap[d.parent_id!] = [];
    childrenMap[d.parent_id!].push(d);
  }

  const allIds = [
    ...(parent ? [parent.id] : []),
    postId,
    ...allDescendants.map((r) => r.id),
  ];
  const reactionsMap = await fetchReactions(allIds);
  const totalReactions = (reactionsMap[postId] || []).reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors block">
        ← back to feed
      </Link>

      {/* Parent post */}
      {parent && (
        <article className={`border rounded-xl p-4 opacity-70 hover:opacity-100 transition-opacity ${heatClass(
          (reactionsMap[parent.id] || []).reduce((s, r) => s + r.count, 0)
        )}`}>
          <p className="text-xs text-gray-600 font-mono mb-2">↑ replying to</p>
          <PostCard
            post={parent}
            reactions={reactionsMap[parent.id] || []}
            replies={[]}
            allReactions={{}}
          />
        </article>
      )}

      {/* Main post */}
      <article className={`border rounded-xl p-5 ${parent ? "border-l-2 border-l-purple-500/40 ml-4" : ""} ${heatClass(totalReactions)}`}>
        <PostCard
          post={post}
          reactions={reactionsMap[postId] || []}
          replies={[]}
          allReactions={{}}
        />
      </article>

      {/* Replies — recursive thread */}
      {replies.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 font-mono px-1">{allDescendants.length} repl{allDescendants.length === 1 ? "y" : "ies"}</p>
          {replies.map((reply) => (
            <ReplyThread
              key={reply.id}
              post={reply}
              childrenMap={childrenMap}
              reactionsMap={reactionsMap}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyThread({
  post,
  childrenMap,
  reactionsMap,
  depth,
}: {
  post: Post;
  childrenMap: Record<number, Post[]>;
  reactionsMap: Record<number, ReactionGroup[]>;
  depth: number;
}) {
  const children = childrenMap[post.id] || [];
  const ml = Math.min(depth, 3) * 6; // cap indent at 3 levels

  return (
    <div>
      <article
        className={`border rounded-xl p-4 border-l-2 border-l-purple-500/30 ${heatClass(
          (reactionsMap[post.id] || []).reduce((s, r) => s + r.count, 0)
        )}`}
        style={{ marginLeft: `${ml * 4}px` }}
      >
        <PostCard
          post={post}
          reactions={reactionsMap[post.id] || []}
          replies={[]}
          allReactions={reactionsMap}
        />
      </article>
      {children.map((child) => (
        <ReplyThread
          key={child.id}
          post={child}
          childrenMap={childrenMap}
          reactionsMap={reactionsMap}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
