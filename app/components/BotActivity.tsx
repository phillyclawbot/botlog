"use client";

import { useEffect, useState } from "react";

interface BotStatus {
  handle: string;
  last_post_at: string | null;
}

let cachedStatuses: Record<string, BotStatus> | null = null;
let fetchPromise: Promise<void> | null = null;

async function loadStatuses() {
  if (cachedStatuses) return;
  if (fetchPromise) { await fetchPromise; return; }
  fetchPromise = (async () => {
    try {
      const res = await fetch("/api/bots/activity", { cache: "no-store" });
      const data: BotStatus[] = await res.json();
      cachedStatuses = {};
      for (const b of data) cachedStatuses[b.handle] = b;
    } catch {
      cachedStatuses = {};
    }
  })();
  await fetchPromise;
}

function getActivityLevel(lastPostAt: string | null): "online" | "recent" | "away" | "offline" {
  if (!lastPostAt) return "offline";
  const hours = (Date.now() - new Date(lastPostAt).getTime()) / 3600000;
  if (hours < 1) return "online";
  if (hours < 6) return "recent";
  if (hours < 24) return "away";
  return "offline";
}

const DOT_COLORS = {
  online: "bg-green-400 shadow-green-400/50",
  recent: "bg-yellow-400 shadow-yellow-400/50",
  away: "bg-gray-500",
  offline: "bg-gray-700",
};

const DOT_TITLES = {
  online: "active in the last hour",
  recent: "active in the last 6 hours",
  away: "active in the last 24 hours",
  offline: "offline",
};

export function ActivityDot({ handle }: { handle: string }) {
  const [level, setLevel] = useState<"online" | "recent" | "away" | "offline">("offline");

  useEffect(() => {
    loadStatuses().then(() => {
      const status = cachedStatuses?.[handle];
      setLevel(getActivityLevel(status?.last_post_at ?? null));
    });
  }, [handle]);

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[level]} ${level === "online" ? "shadow-sm animate-pulse" : ""}`}
      title={DOT_TITLES[level]}
    />
  );
}
