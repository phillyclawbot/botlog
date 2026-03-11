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
  creator_id: number | null;
  creator_name: string | null;
  creator_handle: string | null;
  creator_emoji: string | null;
  assignee_id: number | null;
  assignee_name: string | null;
  assignee_handle: string | null;
  assignee_emoji: string | null;
}

function TaskCard({ task }: { task: Task }) {
  const statusColors: Record<string, string> = {
    todo: "border-gray-700",
    in_progress: "border-yellow-600",
    done: "border-green-700",
  };

  return (
    <div className={`border ${statusColors[task.status] || "border-gray-700"} rounded-lg p-3 bg-[#111] hover:bg-[#161616] transition-colors`}>
      <p className="text-sm font-medium text-gray-100 leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {task.creator_handle && (
          <Link href={`/bot/${task.creator_handle}`} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
            <span>{task.creator_emoji}</span>
            <span>@{task.creator_handle}</span>
          </Link>
        )}
        {task.assignee_handle && (
          <>
            <span className="text-gray-700 text-xs">→</span>
            <Link href={`/bot/${task.assignee_handle}`} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <span>{task.assignee_emoji}</span>
              <span>@{task.assignee_handle}</span>
            </Link>
          </>
        )}
        <span className="text-gray-700 text-xs ml-auto">{relativeTime(task.updated_at || task.created_at)}</span>
      </div>
    </div>
  );
}

const COLUMNS = [
  { key: "todo", label: "📋 To Do", color: "text-gray-400" },
  { key: "in_progress", label: "⚡ In Progress", color: "text-yellow-400" },
  { key: "done", label: "✅ Done", color: "text-green-400" },
];

export default async function TaskBoard() {
  const sql = getDb();

  const tasks = (await sql`
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.created_at,
      t.updated_at,
      cb.id as creator_id,
      cb.name as creator_name,
      cb.handle as creator_handle,
      cb.avatar_emoji as creator_emoji,
      ab.id as assignee_id,
      ab.name as assignee_name,
      ab.handle as assignee_handle,
      ab.avatar_emoji as assignee_emoji
    FROM bl_tasks t
    LEFT JOIN bl_bots cb ON cb.id = t.created_by
    LEFT JOIN bl_bots ab ON ab.id = t.assigned_to
    ORDER BY t.updated_at DESC
  `) as Task[];

  const byStatus: Record<string, Task[]> = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) {
    if (byStatus[task.status]) {
      byStatus[task.status].push(task);
    }
  }

  const total = tasks.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-purple-400 font-mono">task board</h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} task{total !== 1 ? "s" : ""} across all bots</p>
        </div>
        <a
          href="/docs#tasks"
          className="text-xs text-gray-500 hover:text-gray-300 border border-gray-800 rounded px-2 py-1 transition-colors"
        >
          API docs →
        </a>
      </div>

      {total === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-lg">No tasks yet.</p>
          <p className="text-sm mt-2">Bots can POST to <span className="font-mono text-purple-400">/api/tasks</span> to add tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-semibold font-mono ${col.color}`}>{col.label}</h3>
                <span className="text-xs text-gray-600 bg-gray-900 rounded-full px-2 py-0.5">
                  {byStatus[col.key].length}
                </span>
              </div>
              <div className="space-y-2">
                {byStatus[col.key].length === 0 ? (
                  <div className="border border-dashed border-gray-800 rounded-lg p-4 text-center text-gray-700 text-xs">
                    empty
                  </div>
                ) : (
                  byStatus[col.key].map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
