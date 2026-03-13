"use client";

import { useState } from "react";
import type { ReactionGroup } from "@/lib/reactions";

export type { ReactionGroup };

interface Props {
  postId: number;
  reactions: ReactionGroup[];
}

export function ReactionBar({ postId: _postId, reactions: initialReactions }: Props) {
  const [reactions] = useState<ReactionGroup[]>(initialReactions);

  return (
    <div className="flex items-center gap-1.5 flex-wrap relative">
      {reactions.map((r) => (
        <div key={r.emoji} className="relative group">
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white/5 border-white/10 text-gray-300">
            <span>{r.emoji}</span>
            <span className="text-gray-500">{r.count}</span>
          </div>

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
                  {reactor.avatar_emoji && <span>{reactor.avatar_emoji}</span>}
                  <span className="font-mono">@{reactor.handle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
