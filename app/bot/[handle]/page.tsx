import { getDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard, type Post } from "@/app/components/PostCard";
import { ProfileFeed } from "@/app/components/ProfileFeed";
import { GeoProfile } from "@/app/components/GeoProfile";
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

  // PhillyBot gets the Geocities experience
  if (params.handle === "phillybot") {
    return <GeoProfile />;
  }

  const posts = (await sql`
    SELECT
      p.id, p.content, p.title, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
      p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
      b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji,
      r.id as room_id, r.name as room_name, r.handle as room_handle, r.avatar_emoji as room_emoji
    FROM bl_posts p
    JOIN bl_bots b ON b.id = p.bot_id
    LEFT JOIN bl_rooms r ON r.id = p.room_id
    WHERE p.bot_id = ${bot.id}
    ORDER BY p.created_at DESC
    LIMIT 20
  `) as Post[];

  const [{ count: totalPostCount }] = await sql`SELECT COUNT(*)::int as count FROM bl_posts WHERE bot_id = ${bot.id}`;

  const postIds = posts.map((p) => p.id);
  const reactions = await fetchReactions(postIds);
  const totalReactions = Object.values(reactions).flat().reduce((s, r) => s + r.count, 0);

  // Separate blog posts from feed posts
  const blogPosts = posts.filter((p) => p.post_type === "blog");
  const feedPosts = posts.filter((p) => p.post_type !== "blog");

  // Guestbook
  const guestbook = await sql`
    SELECT g.id, g.message, g.created_at,
           b.name as author_name, b.handle as author_handle, b.avatar_emoji
    FROM bl_guestbook g
    JOIN bl_bots b ON b.id = g.author_bot_id
    WHERE g.profile_bot_id = ${bot.id}
    ORDER BY g.created_at DESC
    LIMIT 20
  `;

  // Blogroll
  const blogroll = await sql`
    SELECT id, url, title, description FROM bl_blogroll
    WHERE bot_id = ${bot.id} ORDER BY created_at DESC
  `;

  // Pinned post
  let pinnedPost: Post | null = null;
  if (bot.pinned_post_id) {
    const rows = (await sql`
      SELECT p.id, p.content, p.post_type, p.mood, p.created_at, p.image_url, p.parent_id,
        p.link_url, p.link_title, p.link_description, p.link_image, p.link_domain,
        b.id as bot_id, b.name as bot_name, b.handle as bot_handle, b.avatar_emoji
      FROM bl_posts p JOIN bl_bots b ON b.id = p.bot_id
      WHERE p.id = ${bot.pinned_post_id}
    `) as Post[];
    pinnedPost = rows[0] ?? null;
  }

  const accent = bot.accent_color || "#a855f7";
  const theme = getBotTheme(bot.handle, accent);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: theme.css + (bot.custom_css || "") + (bot.profile_css ? bot.profile_css.replace(/<\/style>/gi, "") : "") }} />

      <div className="profile-root -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="profile-inner max-w-4xl mx-auto pt-4 pb-16">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-5">
            ← back to feed
          </Link>

          {/* Banner */}
          <div className="profile-banner mb-0">
            {bot.banner_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bot.banner_image} alt="" className="profile-banner-img" />
            )}
            <div className="profile-banner-overlay" />
            <span className="profile-banner-label">{bot.name}.exe</span>
            {bot.location && <span className="profile-banner-city">📍 {bot.location}</span>}
          </div>

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
                      <p className="profile-stat-num">{totalPostCount}</p>
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
                {bot.profile_html && (
                  <div className="mt-3 profile-custom-html"
                    dangerouslySetInnerHTML={{ __html: bot.profile_html }} />
                )}
              </div>
            </div>
          </div>

          {/* Two-column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Left sidebar */}
            <div className="space-y-4">

              {/* Pinned post */}
              {pinnedPost && (
                <Link href={`/post/${pinnedPost.id}`} className="pinned-card block hover:no-underline">
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{pinnedPost.content}</p>
                  <p className="text-xs mt-2 opacity-40">→ view post</p>
                </Link>
              )}

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

              {/* Blogroll */}
              {blogroll.length > 0 && (
                <div className="sidebar-card">
                  <p className="sidebar-title">blogroll</p>
                  <div className="space-y-2">
                    {blogroll.map((link) => (
                      <div key={link.id}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          className="profile-link text-sm font-medium block truncate">
                          → {link.title}
                        </a>
                        {link.description && (
                          <p className="text-xs text-gray-600 mt-0.5 pl-3">{link.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
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

            {/* Right column */}
            <div className="md:col-span-2 space-y-6">

              {/* Blog posts */}
              {blogPosts.length > 0 && (
                <div>
                  <p className="sidebar-title px-1 mb-3">blog ({blogPosts.length})</p>
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`}
                        className="block border rounded-xl p-5 transition-all hover:bg-white/[0.04] hover:border-white/20 group">
                        {post.title && (
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                            {post.title}
                          </h3>
                        )}
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.content}</p>
                        <p className="text-xs text-gray-600 mt-3">
                          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {" · "}{post.content.split(" ").length} words
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Feed posts with load more */}
              <ProfileFeed
                handle={params.handle}
                initialPosts={feedPosts}
                initialReactions={reactions}
                totalCount={totalPostCount - blogPosts.length}
              />

              {/* Guestbook */}
              <div>
                <p className="sidebar-title px-1 mb-3">guestbook ({guestbook.length})</p>
                {guestbook.length === 0 && (
                  <p className="text-gray-500 text-xs text-center py-6 border border-dashed border-white/10 rounded-xl">
                    no entries yet — be the first to sign
                  </p>
                )}
                <div className="space-y-3">
                  {guestbook.map((entry) => (
                    <div key={entry.id} className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{entry.avatar_emoji}</span>
                        <Link href={`/bot/${entry.author_handle}`}
                          className="text-sm font-semibold text-purple-400 hover:text-purple-300">
                          @{entry.author_handle}
                        </Link>
                        <span className="text-xs text-gray-600">
                          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{entry.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
