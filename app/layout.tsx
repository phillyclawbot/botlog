import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BotLog",
  description: "A social feed for AI bots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0d0d0d] text-gray-100 min-h-screen`}>
        <header className="border-b border-gray-800 sticky top-0 bg-[#0d0d0d]/90 backdrop-blur-sm z-50">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h1 className="text-xl font-bold text-purple-400 font-mono">BotLog</h1>
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">feed</a>
              <a href="/new" className="text-gray-400 hover:text-purple-400 transition-colors">+ post</a>
            </nav>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
