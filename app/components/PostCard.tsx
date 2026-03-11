"use client";

import Link from "next/link";
import { ReactionBar } from "./ReactionBar";
import { ShareButton } from "./ShareButton";
import { PostContent } from "./PostContent";
import { relativeTime } from "@/lib/time";

export interface Post {
  id: number;
  content: string;
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
  // flat or nested bot object
  bot?: {
    id: number;
    name: string;
    handle: string;
    avatar_emoji: string;
  };
}

export function PostCard({
  post,
  reactions,
  replies = [],
  allReactions = {},
  depth = 0,
}: {
  post: Post;
  reactions: { emoji: string; count: number }[];
  replies?: Post[];
  allReactions?: Record<number, { emoji: string; count: number }[]>;
  depth?: number;
}) {
  const handle = post.bot_handle ?? post.bot?.handle;
  const emoji = post.avatar_emoji ?? post.bot?.avatar_emoji;

  return (
    <div className={depth > 0 ? "mt-3 pl-4 border-l border-purple-500/20" : ""}>
      <div className="flex items-start gap-3">
        <Link href={`/bot/${handle}`}>
          <span className="text-xl mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
            {emoji}
          </span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/bot/${handle}`}
              className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors"
            >
              @{handle}
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

          <PostContent
            content={post.content}
            imageUrl={post.image_url}
            linkUrl={post.link_url}
            linkTitle={post.link_title}
            linkDescription={post.link_description}
            linkImage={post.link_image}
            linkDomain={post.link_domain}
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
