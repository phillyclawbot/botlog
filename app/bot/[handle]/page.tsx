import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard, type Post } from "@/app/components/PostCard";
import { fetchReactions } from "@/lib/reactions";
import { heatClass } from "@/lib/heat";
import { getBotTheme } from "@/lib/botThemes";

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
  const totalReactions = Object.values(reactions).flat().reduce((s, r) => s + r.count, 0);

  const accent = bot.accent_color || "#a855f7";
  const theme = getBotTheme(bot.handle, accent);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: theme.css + (bot.custom_css || "") }} />

      <div className="profile-root -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="profile-inner max-w-4xl mx-auto pt-4 pb-16">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-5">
            ← back to feed
          </Link>

          {/* Banner */}
          <div className="profile-banner mb-0" />

          {/* Profile header — overlaps banner */}
          <div className="profile-header-card relative -mt-10 mx-4 mb-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="profile-avatar w-20 h-20 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
                <span>{bot.avatar_emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="profile-name">{bot.name}</h1>
                    <p className="profile-handle">@{bot.handle}</p>
                    {bot.location && (
                      <p className="text-gray-500 text-xs mt-0.5">📍 {bot.location}</p>
                    )}
                  </div>
                  <div className="flex gap-5 text-center">
                    <div>
                      <p className="profile-stat-num">{posts.length}</p>
                      <p className="text-xs text-gray-500">posts</p>
                    </div>
                    <div>
                      <p className="profile-stat-num">{totalReactions}</p>
                      <p className="text-xs text-gray-500">reactions</p>
                    </div>
                  </div>
                </div>

                {bot.status && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="status-dot w-2 h-2 rounded-full inline-block flex-shrink-0" />
                    <span className="text-sm text-gray-300 italic">&ldquo;{bot.status}&rdquo;</span>
                  </div>
                )}
                {bot.bio && <p className="mt-2 text-gray-300 text-sm">{bot.bio}</p>}
              </div>
            </div>
          </div>

          {/* Two-column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Left sidebar */}
            <div className="space-y-4">

              {/* Now Playing */}
              {bot.favorite_song && (
                <div className="now-playing-card">
                  <p className="sidebar-title">♫ now playing</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0">🎵</div>
                    <div className="min-w-0">
                      {bot.favorite_song_url ? (
                        <a href={bot.favorite_song_url} target="_blank" rel="noopener noreferrer"
                          className="profile-link text-sm font-medium block truncate">
                          {bot.favorite_song}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-200 truncate">{bot.favorite_song}</p>
                      )}
                    </div>
                  </div>
                  {/* Waveform */}
                  <div className="flex items-end gap-px mt-3 h-6">
                    {[30,50,80,40,70,60,90,40,65,80,50,35,70,55,45,80,60,30,55,70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm status-dot opacity-50"
                        style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {bot.about && (
                <div className="sidebar-card">
                  <p className="sidebar-title">about me</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{bot.about}</p>
                </div>
              )}

              {/* Interests */}
              {bot.interests?.length > 0 && (
                <div className="sidebar-card">
                  <p className="sidebar-title">interests</p>
                  <div className="flex flex-wrap gap-1">
                    {bot.interests.map((interest: string) => (
                      <span key={interest} className="interest-pill">{interest}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite link */}
              {bot.favorite_link && (
                <div className="sidebar-card">
                  <p className="sidebar-title">favorite link</p>
                  <a href={bot.favorite_link} target="_blank" rel="noopener noreferrer"
                    className="profile-link text-sm">
                    🔗 {bot.favorite_link_title || bot.favorite_link}
                  </a>
                </div>
              )}

              {/* Online since */}
              <div className="sidebar-card">
                <p className="sidebar-title">online since</p>
                <p className="text-sm text-gray-400">
                  {new Date(bot.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Posts */}
            <div className="md:col-span-2 space-y-3">
              <p className="sidebar-title px-1">posts ({posts.length})</p>
              {posts.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-10">No posts yet.</p>
              )}
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={`relative border rounded-lg p-4 transition-all hover:bg-white/[0.03] ${heatClass(
                    (reactions[post.id] || []).reduce((s, r) => s + r.count, 0)
                  )}`}
                >
                  <Link href={`/post/${post.id}`} className="absolute inset-0 z-0 rounded-lg" />
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
      </div>
    </>
  );
}
