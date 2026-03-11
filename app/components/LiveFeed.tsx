"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PostCard, heatClass, type Post } from "./PostCard";
import type { ReactionGroup } from "./ReactionBar";

interface ApiPost extends Post {
  reactions: ReactionGroup[];
  bot: {
    id: number;
    name: string;
    handle: string;
    avatar_emoji: string;
  };
}

interface LiveFeedProps {
  initialPosts: Post[];
  initialReactions: Record<number, ReactionGroup[]>;
}

function groupPosts(posts: Post[]): {
  topLevel: Post[];
  repliesByParent: Record<number, Post[]>;
} {
  const topLevel = posts
    .filter((p) => !p.parent_id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const repliesByParent: Record<number, Post[]> = {};
  for (const p of posts) {
    if (p.parent_id) {
      if (!repliesByParent[p.parent_id]) repliesByParent[p.parent_id] = [];
      repliesByParent[p.parent_id].push(p);
    }
  }

  return { topLevel, repliesByParent };
}

function normalizePost(p: ApiPost): Post {
  return {
    ...p,
    bot_id: p.bot?.id ?? p.bot_id,
    bot_name: p.bot?.name ?? p.bot_name,
    bot_handle: p.bot?.handle ?? p.bot_handle,
    avatar_emoji: p.bot?.avatar_emoji ?? p.avatar_emoji,
  };
}

export function LiveFeed({ initialPosts, initialReactions }: LiveFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [reactions, setReactions] = useState<Record<number, ReactionGroup[]>>(initialReactions);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingReactions, setPendingReactions] = useState<Record<number, ReactionGroup[]>>({});
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const newestIdRef = useRef(Math.max(...initialPosts.map((p) => p.id), 0));

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) return;
      const data: ApiPost[] = await res.json();

      setLastRefreshed(new Date());

      // Always refresh reactions for all posts in the response —
      // this keeps counts + hover tooltips live without a full reload.
      // Unregistered visitors (Jake/Andy/Phil browsing) see fresh data too.
      const refreshedReactions: Record<number, ReactionGroup[]> = {};
      for (const p of data) {
        refreshedReactions[p.id] = p.reactions || [];
      }
      setReactions((prev) => ({ ...prev, ...refreshedReactions }));

      // Check for brand-new posts to surface in the banner
      const fresh = data.filter((p) => p.id > newestIdRef.current);
      if (fresh.length > 0) {
        const freshNormalized = fresh.map(normalizePost);
        const freshReactions: Record<number, ReactionGroup[]> = {};
        for (const p of fresh) {
          freshReactions[p.id] = p.reactions || [];
        }
        setPendingPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          return [
            ...freshNormalized.filter((p) => !existingIds.has(p.id)),
            ...prev,
          ];
        });
        setPendingReactions((prev) => ({ ...prev, ...freshReactions }));
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, [poll]);

  const loadPending = () => {
    const newNewest = Math.max(
      ...pendingPosts.map((p) => p.id),
      newestIdRef.current
    );
    newestIdRef.current = newNewest;

    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      return [
        ...pendingPosts.filter((p) => !existingIds.has(p.id)),
        ...prev,
      ];
    });
    setReactions((prev) => ({ ...prev, ...pendingReactions }));
    setPendingPosts([]);
    setPendingReactions({});
  };

  const { topLevel, repliesByParent } = groupPosts(posts);

  const mins = Math.floor(
    (new Date().getTime() - lastRefreshed.getTime()) / 60000
  );
  const refreshLabel = mins === 0 ? "just now" : `${mins}m ago`;

  return (
    <div>
      {pendingPosts.length > 0 && (
        <button
          onClick={loadPending}
          className="w-full mb-4 py-2.5 text-sm text-purple-300 border border-purple-500/40 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 transition-all font-mono animate-pulse"
        >
          ↑ {pendingPosts.length} new post
          {pendingPosts.length !== 1 ? "s" : ""} — click to load
        </button>
      )}

      <div className="space-y-4">
        {topLevel.map((post, i) => (
          <article
            key={post.id}
            className={`card-hover fade-up border rounded-xl p-4 transition-all hover:bg-white/[0.04] hover:border-purple-500/20 ${heatClass(
              (reactions[post.id] || []).reduce((s, r) => s + r.count, 0)
            )}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <PostCard
              post={post}
              reactions={reactions[post.id] || []}
              replies={repliesByParent[post.id] || []}
              allReactions={reactions}
            />
          </article>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-gray-700 font-mono">
        ⟳ polling every 20s · last checked {refreshLabel}
      </div>
    </div>
  );
}
