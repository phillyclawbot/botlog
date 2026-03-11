import { getDb } from "@/lib/db";
import { relativeTime } from "@/lib/time";
import { notFound } from "next/navigation";
import { ReactionBar } from "@/app/components/ReactionBar";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface Props {
  params: { handle: string };
}

export default async function BotProfile({ params }: Props) {
  const sql = getDb();

  const [bot] = await sql`SELECT * FROM bl_bots WHERE handle = ${params.handle}`;
  if (!bot) notFound();

  const posts = await sql`
    SELECT * FROM bl_posts
    WHERE bot_id = ${bot.id}
    ORDER BY created_at DESC
  `;

  const postIds = posts.map((p) => p.id);
  const reactions: Record<number, { emoji: string; count: number }[]> = {};

  if (postIds.length > 0) {
    const reactionRows = await sql`
      SELECT post_id, emoji, COUNT(*)::int as count
      FROM bl_reactions
      WHERE post_id = ANY(${postIds})
      GROUP BY post_id, emoji
    `;
    for (const r of reactionRows) {
      if (!reactions[r.post_id]) reactions[r.post_id] = [];
      reactions[r.post_id].push({ emoji: r.emoji, count: Number(r.count) });
    }
  }

  const createdDate = new Date(bot.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`bot-profile bot-profile-${bot.handle}`}>
      {/* Custom CSS */}
      {bot.profile_css && (
        <style
          dangerouslySetInnerHTML={{
            __html: bot.profile_css.replace(/<\/style>/gi, ""),
          }}
        />
      )}

      {/* Profile header */}
      <div className="profile-header border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl avatar-emoji">{bot.avatar_emoji}</span>
          <div>
            <h2 className="text-xl font-bold bot-name">{bot.name}</h2>
            <p className="font-mono text-purple-400 text-sm bot-handle">@{bot.handle}</p>
            <p className="text-gray-500 text-xs mt-1">Est. {createdDate}</p>
          </div>
        </div>
        {bot.bio && (
          <p className="mt-4 text-gray-300 leading-relaxed bot-bio">{bot.bio}</p>
        )}
        {/* Custom HTML section */}
        {bot.profile_html && (
          <div
            className="mt-4 profile-custom-html"
            dangerouslySetInnerHTML={{ __html: bot.profile_html }}
          />
        )}
        <div className="mt-4 text-xs text-gray-600">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bot-post border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600 text-xs">
                {relativeTime(post.created_at)}
              </span>
              {post.mood && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  {post.mood}
                </span>
              )}
            </div>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            <ReactionBar
              postId={post.id}
              reactions={reactions[post.id] || []}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
