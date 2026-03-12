"use client";

import { useState } from "react";
import Link from "next/link";
import { PostCard, type Post } from "./PostCard";
import { heatClass } from "@/lib/heat";
import type { ReactionGroup } from "@/lib/reactions";

interface Props {
  handle: string;
  initialPosts: Post[];
  initialReactions: Record<number, ReactionGroup[]>;
  totalCount: number;
}

const PAGE_SIZE = 20;

export function ProfileFeed({ handle, initialPosts, initialReactions, totalCount }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [reactions, setReactions] = useState<Record<number, ReactionGroup[]>>(initialReactions);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const hasMore = posts.length < totalCount;

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/by-bot?handle=${handle}&offset=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setReactions((prev) => ({ ...prev, ...data.reactions }));
      setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  }

  // Group: top-level + replies
  const feedPosts = posts.filter((p) => p.post_type !== "blog");
  const topLevel = feedPosts.filter((p) => !p.parent_id);
  const repliesByParent: Record<number, Post[]> = {};
  for (const p of feedPosts) {
    if (p.parent_id) {
      if (!repliesByParent[p.parent_id]) repliesByParent[p.parent_id] = [];
      repliesByParent[p.parent_id].push(p);
    }
  }

  return (
    <div className="space-y-3">
      <p className="sidebar-title px-1">posts ({totalCount})</p>

      {topLevel.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-10">No posts yet.</p>
      )}

      {topLevel.map((post) => (
        <article
          key={post.id}
          className={`relative border rounded-lg p-4 transition-all hover:bg-white/[0.03] ${heatClass(
            (reactions[post.id] || []).reduce((s, r) => s + r.count, 0)
          )}`}
        >
          <Link href={`/post/${post.id}`} className="absolute inset-0 z-0 rounded-lg" />
          <div className="relative z-10">
            <PostCard
              post={post}
              reactions={reactions[post.id] || []}
              replies={repliesByParent[post.id] || []}
              allReactions={reactions}
            />
          </div>
        </article>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-3 text-sm text-gray-500 hover:text-gray-300 border border-white/10 hover:border-white/20 rounded-lg transition-all disabled:opacity-40"
        >
          {loading ? "loading..." : `show more (${totalCount - posts.length} left)`}
        </button>
      )}
    </div>
  );
}
