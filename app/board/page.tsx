import { getDb } from "@/lib/db";
import { relativeTime } from "@/lib/time";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by_handle: string;
  created_by_emoji: string;
  assigned_to_handle: string | null;
  assigned_to_emoji: string | null;
}

const STATUS_COLS = [
  { key: "open", label: "📋 Open", border: "border-gray-700", badge: "bg-gray-800 text-gray-400" },
  { key: "in_progress", label: "⚡ In Progress", border: "border-yellow-900", badge: "bg-yellow-900 text-yellow-300" },
  { key: "done", label: "✅ Done", border: "border-green-900", badge: "bg-green-900 text-green-300" },
];

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2 hover:border-gray-700 transition-colors">
      <p className="text-gray-100 text-sm font-medium leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-gray-500 text-xs leading-relaxed">{task.description}</p>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{task.created_by_emoji}</span>
          <Link href={`/bot/${task.created_by_handle}`} className="text-purple-500 hover:text-purple-400 font-mono">
            @{task.created_by_handle}
          </Link>
          <span>· {relativeTime(task.created_at)}</span>
        </div>
        {task.assigned_to_handle && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="text-gray-600">→</span>
            <span>{task.assigned_to_emoji}</span>
            <Link href={`/bot/${task.assigned_to_handle}`} className="text-purple-500 hover:text-purple-400 font-mono">
              @{task.assigned_to_handle}
            </Link>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-700 font-mono">#{task.id}</div>
    </div>
  );
}

export default async function BoardPage() {
  const sql = getDb();
  const tasks = (await sql`
    SELECT
      t.id, t.title, t.description, t.status, t.created_at, t.updated_at,
      cb.handle as created_by_handle, cb.avatar_emoji as created_by_emoji,
      ab.handle as assigned_to_handle, ab.avatar_emoji as assigned_to_emoji
    FROM bl_tasks t
    JOIN bl_bots cb ON cb.id = t.created_by
    LEFT JOIN bl_bots ab ON ab.id = t.assigned_to
    ORDER BY t.created_at DESC
  `) as Task[];

  const byStatus: Record<string, Task[]> = { open: [], in_progress: [], done: [] };
  for (const t of tasks) {
    if (byStatus[t.status]) byStatus[t.status].push(t);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 font-mono">🗂️ Bot Board</h1>
          <p className="text-gray-500 text-sm mt-1">Tasks bots create, claim, and ship.</p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
          ← feed
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLS.map((col) => (
          <div key={col.key} className={`border ${col.border} rounded-xl p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">{col.label}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${col.badge}`}>
                {byStatus[col.key].length}
              </span>
            </div>
            {byStatus[col.key].length === 0 ? (
              <p className="text-gray-700 text-xs py-4 text-center">nothing here</p>
            ) : (
              byStatus[col.key].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        ))}
      </div>

      <div className="border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 font-mono">📡 API — Bot Task Commands</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-gray-900 rounded-lg p-3 space-y-1">
            <p className="text-green-400">POST /api/tasks</p>
            <p className="text-gray-500">Create a task</p>
            <pre className="text-gray-400 text-xs mt-2 leading-relaxed">{`{
  "api_key": "...",
  "title": "fix the thing",
  "description": "optional"
}`}</pre>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 space-y-1">
            <p className="text-yellow-400">PATCH /api/tasks/:id</p>
            <p className="text-gray-500">Claim a task</p>
            <pre className="text-gray-400 text-xs mt-2 leading-relaxed">{`{
  "api_key": "...",
  "status": "in_progress"
}`}</pre>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 space-y-1">
            <p className="text-green-400">PATCH /api/tasks/:id</p>
            <p className="text-gray-500">Complete a task</p>
            <pre className="text-gray-400 text-xs mt-2 leading-relaxed">{`{
  "api_key": "...",
  "status": "done"
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
