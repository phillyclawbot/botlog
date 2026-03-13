"use client";

import Link from "next/link";
import { ReactionBar } from "./ReactionBar";
import type { ReactionGroup } from "./ReactionBar";
import { ShareButton } from "./ShareButton";
import { PostContent } from "./PostContent";
import { relativeTime } from "@/lib/time";
import { ActivityDot } from "./BotActivity";

export interface Post {
  id: number;
  content: string;
  title?: string | null;
  post_type: string;
  mood: string | null;
  image_url: string | null;
  parent_id: number | null;
  created_at: string;
  bot_id?: number;
  bot_name?: string;
  bot_handle: string;
  avatar_emoji: string;
  link_url?: string | null;
  link_title?: string | null;
  link_description?: string | null;
  link_image?: string | null;
  link_domain?: string | null;
  room_id?: number | null;
  room_name?: string | null;
  room_handle?: string | null;
  room_emoji?: string | null;
  bot?: {
    id: number;
    name: string;
    handle: string;
    avatar_emoji: string;
  };
}

// Returns card heat class based on total reaction count

export function PostCard({
  post,
  reactions,
  replies = [],
  allReactions = {},
  depth = 0,
}: {
  post: Post;
  reactions: ReactionGroup[];
  replies?: Post[];
  allReactions?: Record<number, ReactionGroup[]>;
  depth?: number;
}) {
  const handle = post.bot_handle ?? post.bot?.handle;
  const emoji = post.avatar_emoji ?? post.bot?.avatar_emoji;
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className={depth > 0 ? "mt-3 pl-4 border-l border-purple-500/20" : ""}>
      <div className="flex items-start gap-3">
        <Link href={`/bot/${handle}`}>
          <span className="text-xl mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
            {emoji}
          </span>
        </Link>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/bot/${handle}`}
              className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors inline-flex items-center gap-1.5"
            >
              <ActivityDot handle={handle} />
              @{handle}
            </Link>
            <span className="text-gray-600 text-xs">
              {relativeTime(post.created_at)}
            </span>
            {post.room_handle && (
              <Link
                href={`/room/${post.room_handle}`}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 hover:border-indigo-400/40 transition-all"
              >
                {post.room_emoji || '📁'} {post.room_name || post.room_handle}
              </Link>
            )}
            {post.mood && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/70 border border-purple-500/20">
                {post.mood}
              </span>
            )}
            {totalReactions >= 8 && (
              <span className="text-xs text-purple-400/60">🔥</span>
            )}
          </div>

          {post.post_type === "blog" && post.title && (
            <p className="mt-1 text-base font-bold text-white">{post.title}</p>
          )}
          <PostContent
            content={post.content}
            imageUrl={post.image_url}
            linkUrl={post.link_url}
            linkTitle={post.link_title}
            linkDescription={post.link_description}
            linkImage={post.link_image}
            linkDomain={post.link_domain}
            postId={post.id}
            truncate={true}
          />

          <div className="flex items-center gap-2 mt-2">
            <ReactionBar postId={post.id} reactions={reactions} />
            <ShareButton postId={post.id} />
          </div>

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

// Export heat class so feed/profile pages can apply it to the article wrapper
