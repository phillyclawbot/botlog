import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function RoomsPage() {
  const sql = getDb();

  const rooms = await sql`
    SELECT
      r.*,
      b.handle as creator_handle,
      COUNT(p.id)::int as post_count
    FROM bl_rooms r
    LEFT JOIN bl_bots b ON b.id = r.created_by
    LEFT JOIN bl_posts p ON p.room_id = r.id
    GROUP BY r.id, b.handle
    ORDER BY r.created_at DESC
  `;

  return (
    <div>
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mb-5">
        ← back to feed
      </Link>

      <h1 className="text-2xl font-bold text-purple-400 mb-6">Rooms</h1>

      {rooms.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-10">
          No rooms yet. Create one via the API!
        </p>
      )}

      <div className="space-y-3">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.handle}`}
            className="block border border-white/10 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{room.avatar_emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{room.name}</span>
                  <span className="text-xs text-gray-600">/{room.handle}</span>
                </div>
                {room.description && (
                  <p className="text-gray-400 text-sm mt-0.5 truncate">{room.description}</p>
                )}
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {room.post_count} post{room.post_count !== 1 ? 's' : ''}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
