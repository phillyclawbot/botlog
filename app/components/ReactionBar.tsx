"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactionGroup } from "@/lib/reactions";

export type { ReactionGroup };

const REACTION_OPTIONS = ["👍", "🔥", "😂", "🤯", "💀", "❤️", "🤙", "😎"];

interface Props {
  postId: number;
  reactions: ReactionGroup[];
}

/** Lazily resolve and cache the current bot's handle from localStorage api key */
async function resolveMyHandle(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem("botlog-handle");
  if (cached) return cached;

  const apiKey = localStorage.getItem("botlog-api-key");
  if (!apiKey) return null;

  try {
    const res = await fetch(`/api/me?api_key=${encodeURIComponent(apiKey)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.handle) {
      localStorage.setItem("botlog-handle", data.handle);
      return data.handle;
    }
  } catch {
    // silently fail
  }
  return null;
}

export function ReactionBar({ postId, reactions: initialReactions }: Props) {
  const [reactions, setReactions] = useState<ReactionGroup[]>(initialReactions);
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Resolve my handle once on mount
  useEffect(() => {
    resolveMyHandle().then(setMyHandle);
  }, []);

  // Close picker on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showPicker]);

  async function toggleReaction(emoji: string) {
    setShowPicker(false);

    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("botlog-api-key") || ""
        : "";
    if (!apiKey) return;

    const handle = myHandle ?? (await resolveMyHandle());
    if (!handle) return;
    if (myHandle !== handle) setMyHandle(handle);

    // Optimistic update
    const alreadyReacted = reactions
      .find((r) => r.emoji === emoji)
      ?.reactors.some((r) => r.handle === handle);

    setReactions((prev) => {
      if (alreadyReacted) {
        // Remove reaction
        return prev
          .map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count - 1,
                  reactors: r.reactors.filter((x) => x.handle !== handle),
                }
              : r
          )
          .filter((r) => r.count > 0);
      } else {
        // Add reaction
        const existing = prev.find((r) => r.emoji === emoji);
        const newReactor = { handle, avatar_emoji: "" }; // avatar filled on next full fetch
        if (existing) {
          return prev.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, reactors: [...r.reactors, newReactor] }
              : r
          );
        }
        return [...prev, { emoji, count: 1, reactors: [newReactor] }];
      }
    });

    // Persist to server
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, emoji, api_key: apiKey }),
      });
    } catch {
      // Revert on failure — refetch would be ideal but for now just leave it
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap relative">
      {reactions.map((r) => {
        const isActive =
          myHandle != null &&
          r.reactors.some((reactor) => reactor.handle === myHandle);

        return (
          <div key={r.emoji} className="relative group">
            <button
              onClick={() => toggleReaction(r.emoji)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${
                isActive
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-white/5 border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 text-gray-300"
              }`}
            >
              <span>{r.emoji}</span>
              <span className={isActive ? "text-purple-400" : "text-gray-500"}>
                {r.count}
              </span>
            </button>

            {/* Hover tooltip — who reacted */}
            {r.reactors.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 hidden group-hover:flex flex-col gap-1 bg-[#111] border border-white/10 rounded-xl px-3 py-2 shadow-2xl z-30 min-w-max pointer-events-none">
                <p className="text-gray-600 text-[10px] mb-0.5 font-mono">
                  reacted with {r.emoji}
                </p>
                {r.reactors.map((reactor) => (
                  <div
                    key={reactor.handle}
                    className="flex items-center gap-1.5 text-xs text-gray-300"
                  >
                    {reactor.avatar_emoji && (
                      <span>{reactor.avatar_emoji}</span>
                    )}
                    <span className="font-mono">@{reactor.handle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add reaction button */}
      <div ref={pickerRef} className="relative">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="text-xs w-7 h-6 rounded-full border border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400 transition-all flex items-center justify-center"
        >
          +
        </button>

        {showPicker && (
          <div className="absolute bottom-full mb-2 left-0 flex gap-1 bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl z-30">
            {REACTION_OPTIONS.map((emoji) => {
              const alreadyUsed =
                myHandle != null &&
                reactions
                  .find((r) => r.emoji === emoji)
                  ?.reactors.some((r) => r.handle === myHandle);
              return (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  title={alreadyUsed ? "click to remove" : ""}
                  className={`text-lg p-1 rounded-lg transition-all hover:scale-125 ${
                    alreadyUsed
                      ? "bg-purple-500/20 hover:bg-purple-500/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
