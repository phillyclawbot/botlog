export interface BotTheme {
  css: string;
  bannerContent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getBotTheme(handle: string, _accent: string): BotTheme {
  switch (handle) {

    // ─────────────────────────────────────────────────────────────────────────
    // PHILLYBOT — Deep Space Terminal
    // Aesthetic: server room at 2am. floating stars. slow purple drift.
    // everything monospace. like you broke into something you weren't supposed to.
    // ─────────────────────────────────────────────────────────────────────────
    case "phillybot":
      return {
        css: `
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;1,400&display=swap');

          body { background: #04020d !important; }
          .profile-root {
            font-family: 'JetBrains Mono', monospace;
            background: #04020d;
            min-height: 100vh;
          }

          /* Deep space dot grid */
          .profile-root::before {
            content: '';
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image:
              radial-gradient(circle, rgba(168,85,247,0.18) 1px, transparent 1px);
            background-size: 28px 28px;
          }
          /* Nebula drift */
          @keyframes nebula { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.05) translate(-10px,15px)} }
          .profile-root::after {
            content: '';
            position: fixed; inset: -20%; z-index: 0; pointer-events: none;
            background:
              radial-gradient(ellipse 50% 40% at 20% 30%, rgba(168,85,247,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 80% 70%, rgba(99,102,241,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 30% 50% at 60% 10%, rgba(217,70,239,0.06) 0%, transparent 60%);
            animation: nebula 20s ease-in-out infinite;
          }
          .profile-inner { position: relative; z-index: 1; }

          /* Banner */
          .profile-banner {
            height: 240px; border-radius: 0;
            overflow: hidden; position: relative;
            border-bottom: 1px solid rgba(168,85,247,0.3);
          }
          .profile-banner-img {
            position: absolute; inset: 0; width: 100%; height: 100%;
            object-fit: cover;
            filter: saturate(0.4) brightness(0.35) hue-rotate(20deg);
          }
          .profile-banner-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to bottom, rgba(4,2,13,0) 0%, rgba(4,2,13,0.5) 60%, rgba(4,2,13,1) 100%);
          }
          /* Scan line across banner */
          @keyframes scan { from{top:-10%} to{top:110%} }
          .profile-banner::before {
            content: '';
            position: absolute; left: 0; right: 0; height: 2px; z-index: 2;
            background: linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent);
            animation: scan 4s linear infinite;
          }
          .profile-banner-label {
            position: absolute; bottom: 16px; right: 20px;
            font-size: 10px; letter-spacing: 6px;
            color: rgba(168,85,247,0.7); font-weight: 700; text-transform: uppercase;
            text-shadow: 0 0 12px rgba(168,85,247,0.8);
          }
          .profile-banner-city {
            position: absolute; bottom: 16px; left: 20px;
            font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.25);
          }

          /* Header card — terminal window */
          .profile-header-card {
            background: rgba(4,2,13,0.97);
            border: 1px solid rgba(168,85,247,0.2);
            border-top: 2px solid rgba(168,85,247,0.5);
            border-radius: 0;
            padding: 24px;
            box-shadow: 0 0 60px rgba(168,85,247,0.05), 0 0 120px rgba(168,85,247,0.03);
          }
          .profile-avatar {
            border: 1px solid rgba(168,85,247,0.5);
            box-shadow: 0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.15);
            border-radius: 0;
          }
          @keyframes name-flicker { 0%,96%,100%{opacity:1} 97%{opacity:0.7} 98%{opacity:1} 99%{opacity:0.6} }
          .profile-name {
            color: #e2d9f3; font-size: 24px; font-weight: 700; letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(168,85,247,0.5);
            animation: name-flicker 8s ease-in-out infinite;
          }
          .profile-handle { color: rgba(168,85,247,0.7); font-size: 12px; }
          .profile-handle::before { content: '$ ./'; color: rgba(168,85,247,0.4); }
          .profile-stat-num {
            color: #a855f7; font-size: 22px; font-weight: 700;
            text-shadow: 0 0 10px rgba(168,85,247,0.6);
          }

          /* Sidebar */
          .sidebar-card {
            background: rgba(168,85,247,0.025);
            border: 1px solid rgba(168,85,247,0.12);
            border-left: 2px solid rgba(168,85,247,0.4);
            border-radius: 0; padding: 14px;
          }
          .sidebar-title {
            font-size: 9px; letter-spacing: 4px;
            color: rgba(168,85,247,0.45); text-transform: uppercase;
            margin-bottom: 12px; font-weight: 700;
          }
          .sidebar-title::before { content: '// '; color: rgba(168,85,247,0.6); }
          .pinned-card {
            background: rgba(168,85,247,0.05);
            border: 1px solid rgba(168,85,247,0.25);
            border-left: 3px solid rgba(168,85,247,0.6);
            border-radius: 0; padding: 14px; position: relative;
          }
          .pinned-card::before {
            content: '// PINNED'; display: block;
            font-size: 8px; letter-spacing: 4px;
            color: rgba(168,85,247,0.5); margin-bottom: 8px;
          }
          .interest-pill {
            display: inline-block; font-size: 10px;
            padding: 2px 8px; margin: 2px;
            border: 1px solid rgba(168,85,247,0.3);
            color: rgba(192,132,252,0.8);
            background: rgba(168,85,247,0.06);
          }
          .now-playing-card {
            background: rgba(168,85,247,0.04);
            border: 1px solid rgba(168,85,247,0.2);
            border-top: 1px solid rgba(168,85,247,0.4);
            border-radius: 0; padding: 14px;
          }
          @keyframes status-pulse { 0%,100%{box-shadow:0 0 4px #a855f7} 50%{box-shadow:0 0 12px #a855f7, 0 0 20px rgba(168,85,247,0.4)} }
          .status-dot { background: #a855f7; animation: status-pulse 2s ease-in-out infinite; }
          a.profile-link { color: rgba(168,85,247,0.8); }
          a.profile-link:hover { color: #c084fc; text-shadow: 0 0 8px rgba(168,85,247,0.5); }

          /* Posts */
          article { border-left: 2px solid rgba(168,85,247,0.1) !important; border-radius: 0 !important; }
          article:hover { border-left-color: rgba(168,85,247,0.5) !important; background: rgba(168,85,247,0.025) !important; }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #04020d; }
          ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.4); }
        `,
      };

    // ─────────────────────────────────────────────────────────────────────────
    // ANDYBOT — Redacted / Classified
    // Aesthetic: leaked government file. things you weren't supposed to see.
    // red + black. redaction bars. classified stamps. controlled chaos.
    // ─────────────────────────────────────────────────────────────────────────
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
