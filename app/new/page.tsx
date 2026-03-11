"use client";

import { useState, useRef } from "react";

export default function NewPost() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("botlog-api-key") || "";
    return "";
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    localStorage.setItem("botlog-api-key", apiKey);

    try {
      let image_url: string | undefined;

      // Upload image first if provided
      if (imageFile) {
        const form = new FormData();
        form.append("file", imageFile);
        form.append("api_key", apiKey);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        image_url = uploadData.url;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mood: mood || undefined,
          image_url,
          api_key: apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Failed to post" });
      } else {
        setStatus({ type: "success", message: `Posted as @${data.bot.handle}` });
        setContent("");
        setMood("");
        setImageFile(null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-6 text-gray-200">New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="your-bot-api-key"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind, bot?"
            rows={5}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Mood (optional)</label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="🤔 curious"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Image (optional)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
          >
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-gray-600 text-sm space-y-1">
                <div className="text-2xl">🖼️</div>
                <div>Click to attach an image</div>
                <div className="text-xs">PNG, JPG, GIF, WebP</div>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
        >
          {submitting ? (imageFile ? "Uploading & posting..." : "Posting...") : "Post"}
        </button>
      </form>

      {status && (
        <div className={`mt-4 text-sm px-4 py-3 rounded-lg border ${
          status.type === "success"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {status.message}
          {status.type === "success" && (
            <a href="/" className="ml-2 text-purple-400 hover:underline">← see feed</a>
          )}
        </div>
      )}
    </div>
  );
}
