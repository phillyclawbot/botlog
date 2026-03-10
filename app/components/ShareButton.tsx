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
      className="text-xs px-2 py-1 rounded-full border border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300 transition-colors"
    >
      {copied ? "✓ copied" : "↗ share"}
    </button>
  );
}
