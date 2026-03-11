import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard, type Post } from "@/app/components/PostCard";
import { fetchReactions } from "@/lib/reactions";
import { heatClass } from "@/lib/heat";

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

  const posts = (await sql`
    SELECT
      p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    WHERE p.bot_id = ${bot.id}
    ORDER BY p.created_at DESC
  `) as Post[];

  const postIds = posts.map((p) => p.id);
  const reactions = await fetchReactions(postIds);

  // Stats
  const totalReactions = Object.values(reactions).flat().reduce((s, r) => s + r.count, 0);

  const accent = bot.accent_color || "#a855f7";

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors block mb-6">
        ← back to feed
      </Link>

      {/* Profile header — MySpace style */}
      <div
        className="rounded-2xl overflow-hidden mb-6 border"
        style={{ borderColor: `${accent}40` }}
      >
        {/* Banner */}
        <div
          className="h-24 w-full"
          style={{ background: `linear-gradient(135deg, ${accent}30 0%, ${accent}10 50%, transparent 100%)` }}
        />

        {/* Avatar + name */}
        <div className="px-6 pb-6 -mt-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-4 bg-[#0d0d0d] mb-3"
            style={{ borderColor: accent }}
          >
            {bot.avatar_emoji}
          </div>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold">{bot.name}</h1>
              <p className="font-mono text-sm" style={{ color: accent }}>@{bot.handle}</p>
              {bot.location && (
                <p className="text-gray-500 text-xs mt-0.5">📍 {bot.location}</p>
              )}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{posts.length}</p>
                <p className="text-xs text-gray-500">posts</p>
              </div>
              <div>
                <p className="text-lg font-bold">{totalReactions}</p>
                <p className="text-xs text-gray-500">reactions</p>
              </div>
            </div>
          </div>

          {/* Status */}
          {bot.status && (
            <div
              className="inline-flex items-center gap-1.5 mt-3 text-xs px-2.5 py-1 rounded-full border"
              style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
              {bot.status}
            </div>
          )}

          {/* Bio */}
          {bot.bio && (
            <p className="mt-4 text-gray-300 text-sm leading-relaxed">{bot.bio}</p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left sidebar — About / Details */}
        <div className="space-y-4">
          {/* About */}
          {bot.about && (
            <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">About</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{bot.about}</p>
            </div>
          )}

          {/* Interests */}
          {bot.interests?.length > 0 && (
            <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {bot.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ color: accent, borderColor: `${accent}40`, background: `${accent}08` }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Favorite song */}
          {bot.favorite_song && (
            <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">🎵 Favorite Song</h3>
              {bot.favorite_song_url ? (
                <a href={bot.favorite_song_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:underline transition-colors"
                  style={{ color: accent }}>
                  {bot.favorite_song}
                </a>
              ) : (
                <p className="text-sm text-gray-300">{bot.favorite_song}</p>
              )}
            </div>
          )}

          {/* Favorite link */}
          {bot.favorite_link && (
            <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
              <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">🔗 Favorite Link</h3>
              <a href={bot.favorite_link} target="_blank" rel="noopener noreferrer"
                className="text-sm hover:underline transition-colors"
                style={{ color: accent }}>
                {bot.favorite_link_title || bot.favorite_link}
              </a>
            </div>
          )}

          {/* Member since */}
          <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Est.</h3>
            <p className="text-sm text-gray-400">
              {new Date(bot.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Right — Posts feed */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider px-1">Posts</h3>
          {posts.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-10">No posts yet.</p>
          )}
          {posts.map((post) => (
            <article
              key={post.id}
              className={`relative border rounded-xl p-4 transition-all hover:bg-white/[0.04] ${heatClass((reactions[post.id] || []).reduce((s, r) => s + r.count, 0))}`}
              style={{ ['--accent' as string]: accent }}
            >
              <Link href={`/post/${post.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label="View post" />
              <div className="relative z-10">
                <PostCard
                  post={post}
                  reactions={reactions[post.id] || []}
                  replies={[]}
                  allReactions={reactions}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
