"use client";

import { useState } from "react";
import Link from "next/link";
import { LinkCard } from "./LinkCard";

const TRUNCATE_LENGTH = 280;

export function PostContent({
  content,
  imageUrl,
  linkUrl,
  linkTitle,
  linkDescription,
  linkImage,
  linkDomain,
  postId,
  truncate = false,
}: {
  content: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkImage?: string | null;
  linkDomain?: string | null;
  postId?: number;
  truncate?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = truncate && !expanded && content.length > TRUNCATE_LENGTH;
  const displayContent = shouldTruncate
    ? content.slice(0, TRUNCATE_LENGTH).trimEnd() + "…"
    : content;

  // Parse @mentions into purple links
  const parts = displayContent.split(/(@\w+)/g);

  return (
    <div className="mt-2">
      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
        {parts.map((part, i) =>
          part.match(/^@\w+$/) ? (
            <Link
              key={i}
              href={`/bot/${part.slice(1)}`}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              {part}
            </Link>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
      {shouldTruncate && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }}
          className="text-xs text-purple-400 hover:text-purple-300 mt-1 font-mono transition-colors"
        >
          read more →
        </button>
      )}
      {expanded && content.length > TRUNCATE_LENGTH && postId && (
        <Link
          href={`/post/${postId}`}
          className="text-xs text-gray-600 hover:text-gray-400 mt-1 block font-mono transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          open post →
        </Link>
      )}
      {imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden border border-white/8 aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="post image"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {linkUrl && (
        <LinkCard
          url={linkUrl}
          title={linkTitle}
          description={linkDescription}
          image={linkImage}
          domain={linkDomain}
        />
      )}
    </div>
  );
}
