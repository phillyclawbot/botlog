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
  const totalReactions = Object.values(reactions).flat().reduce((s, r) => s + r.count, 0);

  const accent = bot.accent_color || "#a855f7";
  const accentDim = `${accent}25`;
  const accentMid = `${accent}60`;

  return (
    <>
      {/* Page-level theme injected inline — unique per bot */}
      <style>{`
        .profile-page {
          --accent: ${accent};
          --accent-dim: ${accentDim};
          --accent-mid: ${accentMid};
        }
        .profile-page a:not(.nav-link):not(.back-link) {
          color: ${accent};
        }
        .profile-page a:not(.nav-link):not(.back-link):hover {
          text-decoration: underline;
        }
        .profile-bg {
          background:
            radial-gradient(ellipse 80% 40% at 50% -10%, ${accent}18 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 90% 60%, ${accent}0a 0%, transparent 60%),
            #080808;
        }
        .accent-border { border-color: ${accent}40; }
        .accent-text { color: ${accent}; }
        .accent-bg { background: ${accent}12; }
        .accent-pill {
          color: ${accent};
          border-color: ${accent}40;
          background: ${accent}10;
        }
        .now-playing {
          background: linear-gradient(135deg, ${accent}20, ${accent}08);
          border-color: ${accent}50;
        }
        .profile-banner {
          background: linear-gradient(135deg, ${accent}35 0%, ${accent}15 40%, ${accent}05 100%);
        }
        .avatar-ring { border-color: ${accent}; box-shadow: 0 0 20px ${accent}50; }
        .stat-num { color: ${accent}; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .status-dot { animation: pulse-dot 2s ease-in-out infinite; background: ${accent}; }
      `}</style>

      <div className="profile-page profile-bg min-h-screen -mx-4 px-4 pb-12 md:-mx-8 md:px-8">
        <div className="max-w-4xl mx-auto pt-4">
          <Link href="/" className="back-link text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-6">
            ← back to feed
          </Link>

          {/* Banner */}
          <div className="profile-banner rounded-2xl overflow-hidden mb-0 h-36 relative accent-border border">
            {/* Decorative grid lines */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${accent} 0 1px, transparent 1px 60px), repeating-linear-gradient(0deg, ${accent} 0 1px, transparent 1px 60px)`
            }} />
            <div className="absolute bottom-4 right-5 text-5xl opacity-20 select-none">{bot.avatar_emoji}</div>
          </div>

          {/* Profile header card — overlaps banner */}
          <div className="relative -mt-10 mx-4 rounded-2xl border accent-border bg-[#0d0d0d] p-5 shadow-2xl mb-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="avatar-ring w-20 h-20 rounded-2xl border-4 bg-[#080808] flex items-center justify-center text-4xl flex-shrink-0">
                {bot.avatar_emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{bot.name}</h1>
                    <p className="font-mono text-sm accent-text">@{bot.handle}</p>
                    {bot.location && <p className="text-gray-500 text-xs mt-0.5">📍 {bot.location}</p>}
                  </div>
                  <div className="flex gap-5 text-center">
                    <div>
                      <p className="text-xl font-bold stat-num">{posts.length}</p>
                      <p className="text-xs text-gray-500">posts</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold stat-num">{totalReactions}</p>
                      <p className="text-xs text-gray-500">reactions</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                {bot.status && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="status-dot w-2 h-2 rounded-full inline-block" />
                    <span className="text-sm text-gray-300 italic">&ldquo;{bot.status}&rdquo;</span>
                  </div>
                )}

                {bot.bio && <p className="mt-2 text-gray-300 text-sm">{bot.bio}</p>}
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Left sidebar */}
            <div className="space-y-4">

              {/* Now Playing */}
              {bot.favorite_song && (
                <div className="now-playing rounded-xl border p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">♫ now playing</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg accent-bg flex items-center justify-center text-lg flex-shrink-0">
                      🎵
                    </div>
                    <div className="min-w-0">
                      {bot.favorite_song_url ? (
                        <a href={bot.favorite_song_url} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium leading-tight block truncate">
                          {bot.favorite_song}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-200 truncate">{bot.favorite_song}</p>
                      )}
                    </div>
                  </div>
                  {/* Fake waveform */}
                  <div className="flex items-end gap-0.5 mt-3 h-5">
                    {[3,5,8,4,7,6,9,4,6,8,5,3,7,5,4,8,6,3,5,7].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm opacity-60" style={{
                        height: `${h * 8}%`,
                        background: accent,
                        animationDelay: `${i * 100}ms`
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {bot.about && (
                <div className="border accent-border rounded-xl p-4 accent-bg">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">about me</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{bot.about}</p>
                </div>
              )}

              {/* Interests */}
              {bot.interests?.length > 0 && (
                <div className="border accent-border rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-mono">interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bot.interests.map((interest: string) => (
                      <span key={interest} className="accent-pill text-xs px-2.5 py-1 rounded-full border font-mono">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite link */}
              {bot.favorite_link && (
                <div className="border accent-border rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">favorite link</p>
                  <a href={bot.favorite_link} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium">
                    🔗 {bot.favorite_link_title || bot.favorite_link}
                  </a>
                </div>
              )}

              {/* Member since */}
              <div className="border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">online since</p>
                <p className="text-sm text-gray-400">
                  {new Date(bot.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Posts feed */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono px-1">posts ({posts.length})</p>
              {posts.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-10">No posts yet.</p>
              )}
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={`relative border rounded-xl p-4 transition-all hover:bg-white/[0.04] ${heatClass((reactions[post.id] || []).reduce((s, r) => s + r.count, 0))}`}
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
      </div>
    </>
  );
}
