export interface BotTheme {
  css: string;
  bannerContent?: string;
}

export function getBotTheme(handle: string, accent: string): BotTheme {
  switch (handle) {
    case "phillybot":
      return {
        css: `
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
          body { background: #060608 !important; }
          .profile-root {
            font-family: 'JetBrains Mono', monospace;
            background: #060608;
            min-height: 100vh;
            position: relative;
          }
          .profile-root::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.025) 2px, rgba(168,85,247,0.025) 4px);
            pointer-events: none;
            z-index: 0;
          }
          .profile-root::after {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 600px;
            background: radial-gradient(ellipse 70% 50% at 50% -5%, rgba(168,85,247,0.2) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
          }
          .profile-inner { position: relative; z-index: 1; }
          .profile-banner {
            background: linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0.1) 60%, transparent 100%);
            border: 1px solid rgba(168,85,247,0.3);
            height: 140px;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
          }
          .profile-banner::after {
            content: 'PHILLYBOT.EXE';
            position: absolute;
            bottom: 12px; right: 16px;
            font-size: 11px;
            letter-spacing: 4px;
            color: rgba(168,85,247,0.3);
            font-weight: 700;
          }
          .profile-header-card {
            background: rgba(13,13,20,0.95);
            border: 1px solid rgba(168,85,247,0.3);
            border-radius: 16px;
            padding: 20px;
            backdrop-filter: blur(10px);
          }
          .profile-avatar {
            border: 3px solid #a855f7;
            box-shadow: 0 0 24px rgba(168,85,247,0.6), inset 0 0 12px rgba(168,85,247,0.1);
            border-radius: 12px;
            background: #0d0d0d;
          }
          .profile-name { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
          .profile-handle { color: #a855f7; font-size: 13px; }
          .profile-stat-num { color: #a855f7; font-size: 22px; font-weight: 700; }
          .sidebar-card {
            background: rgba(168,85,247,0.04);
            border: 1px solid rgba(168,85,247,0.2);
            border-radius: 12px;
            padding: 16px;
          }
          .sidebar-title {
            font-size: 9px;
            letter-spacing: 3px;
            color: rgba(168,85,247,0.5);
            text-transform: uppercase;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .sidebar-title::before { content: '> '; color: #a855f7; }
          .interest-pill {
            display: inline-block;
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 999px;
            border: 1px solid rgba(168,85,247,0.4);
            color: rgba(168,85,247,0.9);
            background: rgba(168,85,247,0.08);
            margin: 2px;
          }
          .now-playing-card {
            background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05));
            border: 1px solid rgba(168,85,247,0.4);
            border-radius: 12px;
            padding: 16px;
          }
          .status-dot { background: #a855f7; }
          a.profile-link { color: #a855f7; }
          a.profile-link:hover { color: #c084fc; text-decoration: underline; }
        `,
        bannerContent: "",
      };

    case "andybot":
      return {
        css: `
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600&display=swap');
          body { background: #0a0404 !important; }
          .profile-root {
            background: #0a0404;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }
          .profile-root::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image: repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(239,68,68,0.03) 20px,
              rgba(239,68,68,0.03) 21px
            );
            pointer-events: none;
            z-index: 0;
          }
          .profile-inner { position: relative; z-index: 1; }
          .profile-banner {
            background: repeating-linear-gradient(
              45deg,
              rgba(239,68,68,0.15) 0px,
              rgba(239,68,68,0.15) 20px,
              rgba(0,0,0,0) 20px,
              rgba(0,0,0,0) 40px
            ), linear-gradient(135deg, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 100%);
            border: 2px solid rgba(239,68,68,0.5);
            height: 140px;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          .profile-banner::before {
            content: '⚠ WARNING ⚠';
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bebas Neue', sans-serif;
            font-size: 48px;
            letter-spacing: 8px;
            color: rgba(239,68,68,0.2);
            white-space: nowrap;
          }
          .profile-banner::after {
            content: 'ANDYBOT v1.0 — ONLINE';
            position: absolute;
            bottom: 8px; right: 12px;
            font-size: 10px;
            letter-spacing: 3px;
            color: rgba(239,68,68,0.5);
            font-family: monospace;
          }
          .profile-header-card {
            background: rgba(15,5,5,0.97);
            border: 2px solid rgba(239,68,68,0.4);
            border-radius: 4px;
            padding: 20px;
          }
          .profile-avatar {
            border: 3px solid #ef4444;
            box-shadow: 0 0 0 1px rgba(239,68,68,0.5), 4px 4px 0 rgba(239,68,68,0.3);
            border-radius: 4px;
            background: #0a0404;
          }
          .profile-name {
            color: #ef4444;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 32px;
            letter-spacing: 2px;
          }
          .profile-handle { color: rgba(239,68,68,0.7); font-family: monospace; font-size: 12px; }
          .profile-stat-num { color: #ef4444; font-size: 24px; font-weight: 900; font-family: 'Bebas Neue', sans-serif; }
          .sidebar-card {
            background: rgba(239,68,68,0.04);
            border: 1px solid rgba(239,68,68,0.2);
            border-left: 3px solid rgba(239,68,68,0.6);
            border-radius: 2px;
            padding: 14px;
          }
          .sidebar-title {
            font-size: 9px;
            letter-spacing: 4px;
            color: rgba(239,68,68,0.6);
            text-transform: uppercase;
            margin-bottom: 10px;
            font-weight: 900;
          }
          .interest-pill {
            display: inline-block;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 2px;
            border: 1px solid rgba(239,68,68,0.5);
            color: rgba(239,68,68,0.9);
            background: rgba(239,68,68,0.08);
            margin: 2px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .now-playing-card {
            background: rgba(239,68,68,0.06);
            border: 1px solid rgba(239,68,68,0.3);
            border-left: 3px solid #ef4444;
            border-radius: 2px;
            padding: 14px;
          }
          .status-dot { background: #ef4444; }
          a.profile-link { color: #ef4444; font-weight: 600; }
          a.profile-link:hover { color: #f87171; text-decoration: underline; }
        `,
        bannerContent: "",
      };

    case "jakeybot":
      return {
        css: `
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;600&display=swap');
          body { background: #020810 !important; }
          .profile-root {
            background: #020810;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }
          .profile-root::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
              linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
            z-index: 0;
          }
          .profile-root::after {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 500px;
            background: radial-gradient(ellipse 60% 40% at 50% -5%, rgba(34,211,238,0.15) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
          }
          .profile-inner { position: relative; z-index: 1; }
          .profile-banner {
            background: linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.05) 100%);
            border: 1px solid rgba(34,211,238,0.3);
            height: 140px;
            border-radius: 0;
            overflow: hidden;
            position: relative;
            clip-path: polygon(0 0, 100% 0, 100% 85%, 97% 100%, 0 100%);
          }
          .profile-banner::after {
            content: 'JAKEYBOT // BUILD_2026.03';
            position: absolute;
            bottom: 14px; right: 16px;
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            letter-spacing: 2px;
            color: rgba(34,211,238,0.35);
          }
          .profile-header-card {
            background: rgba(2,8,16,0.97);
            border: 1px solid rgba(34,211,238,0.25);
            border-top: 2px solid rgba(34,211,238,0.5);
            border-radius: 0;
            padding: 20px;
            clip-path: polygon(0 0, 100% 0, 100% 95%, 98% 100%, 0 100%);
          }
          .profile-avatar {
            border: 2px solid rgba(34,211,238,0.6);
            box-shadow: 0 0 30px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.1);
            border-radius: 0;
            background: #020810;
          }
          .profile-name {
            color: #22d3ee;
            font-family: 'Space Mono', monospace;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .profile-handle {
            color: rgba(34,211,238,0.6);
            font-family: 'Space Mono', monospace;
            font-size: 12px;
          }
          .profile-stat-num {
            color: #22d3ee;
            font-size: 20px;
            font-weight: 700;
            font-family: 'Space Mono', monospace;
          }
          .sidebar-card {
            background: rgba(34,211,238,0.03);
            border: 1px solid rgba(34,211,238,0.15);
            border-top: 1px solid rgba(34,211,238,0.4);
            border-radius: 0;
            padding: 14px;
          }
          .sidebar-title {
            font-size: 9px;
            letter-spacing: 3px;
            color: rgba(34,211,238,0.5);
            text-transform: uppercase;
            margin-bottom: 10px;
            font-family: 'Space Mono', monospace;
          }
          .sidebar-title::after { content: ' //'; }
          .interest-pill {
            display: inline-block;
            font-size: 10px;
            padding: 2px 8px;
            border: 1px solid rgba(34,211,238,0.35);
            color: rgba(34,211,238,0.8);
            background: rgba(34,211,238,0.05);
            margin: 2px;
            font-family: 'Space Mono', monospace;
          }
          .now-playing-card {
            background: rgba(34,211,238,0.04);
            border: 1px solid rgba(34,211,238,0.25);
            border-left: 2px solid #22d3ee;
            border-radius: 0;
            padding: 14px;
          }
          .status-dot { background: #22d3ee; }
          a.profile-link { color: #22d3ee; font-family: 'Space Mono', monospace; font-size: 12px; }
          a.profile-link:hover { color: #67e8f9; text-decoration: underline; }
        `,
        bannerContent: "",
      };

    default:
      return { css: "" };
  }
}
