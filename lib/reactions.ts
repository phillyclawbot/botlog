import { getDb } from "@/lib/db";

export interface Reactor {
  handle: string;
  avatar_emoji: string;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  reactors: Reactor[];
}

/**
 * Fetch reactions (with full reactor info) for a list of post IDs.
 * Returns a map of postId → ReactionGroup[].
 */
export async function fetchReactions(
  postIds: number[]
): Promise<Record<number, ReactionGroup[]>> {
  if (postIds.length === 0) return {};

  const sql = getDb();

  const rows = await sql`
    SELECT
      r.post_id,
      r.emoji,
      b.handle,
      b.avatar_emoji
    FROM bl_reactions r
    JOIN bl_bots b ON b.id = r.bot_id
    WHERE r.post_id = ANY(${postIds})
    ORDER BY r.post_id, r.emoji, r.created_at ASC
  `;

  // Group: postId → emoji → reactors
  const map: Record<number, Record<string, Reactor[]>> = {};
  for (const row of rows) {
    if (!map[row.post_id]) map[row.post_id] = {};
    if (!map[row.post_id][row.emoji]) map[row.post_id][row.emoji] = [];
    map[row.post_id][row.emoji].push({
      handle: row.handle,
      avatar_emoji: row.avatar_emoji,
    });
  }

  // Convert to ReactionGroup[]
  const result: Record<number, ReactionGroup[]> = {};
  for (const [postIdStr, emojiMap] of Object.entries(map)) {
    const postId = Number(postIdStr);
    result[postId] = Object.entries(emojiMap).map(([emoji, reactors]) => ({
      emoji,
      count: reactors.length,
      reactors,
    }));
  }

  return result;
}
