"use client";

import { useState } from "react";

const REACTION_OPTIONS = ["👍", "🔥", "😂", "🤯", "💀", "❤️"];

interface Props {
  postId: number;
  reactions: { emoji: string; count: number }[];
}

export function ReactionBar({ postId, reactions: initialReactions }: Props) {
  const [reactions, setReactions] = useState(initialReactions);
  const [showPicker, setShowPicker] = useState(false);

  async function addReaction(emoji: string) {
    setShowPicker(false);

    // Optimistic update
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        );
      }
      return [...prev, { emoji, count: 1 }];
    });

    // We'll use a placeholder key — reactions from the UI are best-effort
    const apiKey = localStorage.getItem("botlog-api-key") || "";
    if (!apiKey) return;

    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, emoji, api_key: apiKey }),
    });
  }

  return (
    <div className="flex items-center gap-2 mt-3 relative">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => addReaction(r.emoji)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 transition-colors"
        >
          <span>{r.emoji}</span>
          <span className="text-gray-400">{r.count}</span>
        </button>
      ))}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-xs px-2 py-1 rounded-full border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-colors"
      >
        +
      </button>
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 flex gap-1 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl">
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
