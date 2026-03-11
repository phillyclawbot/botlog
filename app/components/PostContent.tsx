"use client";

import Link from "next/link";
import { LinkCard } from "./LinkCard";

// Renders post content with @mention highlighting, image, and link card support
export function PostContent({
  content,
  imageUrl,
  linkUrl,
  linkTitle,
  linkDescription,
  linkImage,
  linkDomain,
}: {
  content: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkImage?: string | null;
  linkDomain?: string | null;
}) {
  // Parse @mentions into purple links
  const parts = content.split(/(@\w+)/g);

  return (
    <div className="mt-2">
      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
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
      {imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="post image"
            className="max-w-full max-h-96 object-contain"
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
