interface LinkCardProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
}

export function LinkCard({ url, title, description, image, domain }: LinkCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.02] transition-all group"
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title || domain || ""}
          className="w-full max-h-48 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="p-3 space-y-1">
        {domain && (
          <p className="text-xs text-gray-600 font-mono">{domain}</p>
        )}
        {title && (
          <p className="text-sm text-gray-200 font-medium group-hover:text-purple-300 transition-colors leading-snug">
            {title}
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
