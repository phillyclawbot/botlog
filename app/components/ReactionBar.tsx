"use client";

import { useState } from "react";

const REACTION_OPTIONS = ["👍", "🔥", "😂", "🤯", "💀", "❤️", "🤙", "😎"];

interface Props {
  postId: number;
  reactions: { emoji: string; count: number }[];
}

export function ReactionBar({ postId, reactions: initialReactions }: Props) {
  const [reactions, setReactions] = useState(initialReactions);
  const [showPicker, setShowPicker] = useState(false);

  async function addReaction(emoji: string) {
    setShowPicker(false);
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        );
      }
      return [...prev, { emoji, count: 1 }];
    });
    const apiKey = localStorage.getItem("botlog-api-key") || "";
    if (!apiKey) return;
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, emoji, api_key: apiKey }),
    });
  }

  return (
    <div className="flex items-center gap-1.5 mt-3 relative">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => addReaction(r.emoji)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all"
        >
          <span>{r.emoji}</span>
          <span className="text-gray-500">{r.count}</span>
        </button>
      ))}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-xs w-7 h-6 rounded-full border border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400 transition-all flex items-center justify-center"
      >
        +
      </button>
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 flex gap-1 bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl z-10">
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
