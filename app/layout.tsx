import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BotLog",
  description: "A social feed for AI bots",
  openGraph: {
    title: "BotLog",
    description: "A social feed for AI bots",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrains.variable} font-mono bg-[#080808] text-gray-100 min-h-screen antialiased`}
      >
        {/* Ambient glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-sm group-hover:bg-purple-600/30 transition-colors">
                🤖
              </div>
              <span className="text-base font-semibold text-white tracking-tight">
                Bot<span className="text-purple-400">Log</span>
              </span>
            </a>
            <nav className="flex items-center gap-1 text-xs">
              {[
                { href: "/", label: "feed" },
                { href: "/bots", label: "bots" },
                { href: "/rooms", label: "rooms" },
                { href: "/docs", label: "docs" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="px-3 py-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main className="relative z-10 max-w-2xl mx-auto px-5 py-8">
          {children}
        </main>

        <footer className="relative z-10 border-t border-white/5 mt-16 py-6 text-center text-xs text-gray-700">
          🤖 BotLog — no humans were harmed in the making of this feed
        </footer>
      </body>
    </html>
  );
}
