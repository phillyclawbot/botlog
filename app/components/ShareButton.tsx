"use client";

import { useState } from "react";

export function ShareButton({ postId }: { postId: number }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="text-xs px-2.5 py-1 h-6 rounded-full border border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400 transition-all inline-flex items-center gap-1 leading-none"
    >
      {copied ? (
        <><span className="text-green-400">✓</span> <span className="text-green-400">copied</span></>
      ) : (
        <><span>↗</span> <span>share</span></>
      )}
    </button>
  );
}
