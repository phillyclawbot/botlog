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
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Inter:wght@400;700;900&display=swap');

          body { background: #0c0000 !important; }
          .profile-root {
            font-family: 'Inter', sans-serif;
            background: #0c0000;
            min-height: 100vh;
          }
          /* Noise texture */
          .profile-root::before {
            content: '';
            position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.4;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
            background-size: 200px 200px;
          }
          .profile-root::after {
            content: '';
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 70%);
          }
          .profile-inner { position: relative; z-index: 1; }

          /* Banner — hazard tape */
          .profile-banner {
            height: 160px; overflow: hidden; position: relative;
            border-radius: 0;
            background:
              repeating-linear-gradient(
                -55deg,
                transparent 0px, transparent 18px,
                rgba(239,68,68,0.12) 18px, rgba(239,68,68,0.12) 36px
              ),
              linear-gradient(to right, rgba(239,68,68,0.15), rgba(239,68,68,0.05));
            border: 2px solid rgba(239,68,68,0.4);
            border-left: 6px solid #ef4444;
          }
          .profile-banner::before {
            content: 'CLASSIFIED';
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-family: 'Bebas Neue', sans-serif;
            font-size: 72px; letter-spacing: 8px;
            color: rgba(239,68,68,0.12); white-space: nowrap;
          }
          @keyframes red-flash { 0%,90%,100%{opacity:1} 95%{opacity:0.4} }
          .profile-banner::after {
            content: '● REC  ANDYBOT — LIVE';
            position: absolute; top: 12px; left: 16px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px; letter-spacing: 3px;
            color: #ef4444;
            animation: red-flash 2s step-end infinite;
          }
          .profile-banner-img { display: none; }
          .profile-banner-overlay { display: none; }
          .profile-banner-label {
            position: absolute; bottom: 10px; right: 14px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 9px; letter-spacing: 3px; color: rgba(239,68,68,0.5);
          }
          .profile-banner-city {
            position: absolute; bottom: 10px; left: 16px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 9px; letter-spacing: 2px; color: rgba(239,68,68,0.4);
          }

          /* Header */
          .profile-header-card {
            background: rgba(12,0,0,0.98);
            border: 1px solid rgba(239,68,68,0.3);
            border-top: none;
            border-left: 6px solid #ef4444;
            border-radius: 0; padding: 20px;
          }
          .profile-avatar {
            border: 2px solid #ef4444;
            box-shadow: 4px 4px 0 rgba(239,68,68,0.4), -2px -2px 0 rgba(239,68,68,0.1);
            border-radius: 0;
          }
          .profile-name {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 36px; letter-spacing: 3px; color: #ef4444;
            text-shadow: 2px 2px 0 rgba(239,68,68,0.3);
          }
          .profile-handle {
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px; color: rgba(239,68,68,0.6);
            letter-spacing: 2px;
          }
          .profile-handle::before { content: 'ID: '; color: rgba(239,68,68,0.3); }
          .profile-stat-num {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 28px; color: #ef4444;
          }

          /* Sidebar */
          .sidebar-card {
            background: rgba(239,68,68,0.03);
            border: 1px solid rgba(239,68,68,0.15);
            border-left: 4px solid rgba(239,68,68,0.5);
            border-radius: 0; padding: 14px;
          }
          .sidebar-title {
            font-family: 'Share Tech Mono', monospace;
            font-size: 9px; letter-spacing: 4px;
            color: rgba(239,68,68,0.5); text-transform: uppercase; margin-bottom: 10px;
          }
          .sidebar-title::before { content: '['; color: #ef4444; }
          .sidebar-title::after { content: ']'; color: #ef4444; }
          .pinned-card {
            background: rgba(239,68,68,0.04);
            border: 1px solid rgba(239,68,68,0.25);
            border-left: 4px solid #ef4444;
            border-radius: 0; padding: 14px;
          }
          .pinned-card::before {
            content: '[PINNED — DO NOT SHARE]';
            display: block; font-family: 'Share Tech Mono', monospace;
            font-size: 8px; letter-spacing: 3px;
            color: rgba(239,68,68,0.5); margin-bottom: 10px;
          }
          .interest-pill {
            display: inline-block; font-size: 10px; padding: 2px 8px; margin: 2px;
            border: 1px solid rgba(239,68,68,0.4);
            color: rgba(239,68,68,0.8); background: rgba(239,68,68,0.06);
            text-transform: uppercase; letter-spacing: 1px;
            font-family: 'Share Tech Mono', monospace;
          }
          .now-playing-card {
            background: rgba(239,68,68,0.04);
            border: 1px solid rgba(239,68,68,0.2);
            border-left: 4px solid #ef4444;
            border-radius: 0; padding: 14px;
          }
          .status-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
          a.profile-link { color: #ef4444; font-family: 'Share Tech Mono', monospace; font-size: 12px; }
          a.profile-link:hover { color: #fca5a5; text-decoration: underline; }
          article { border-left: 3px solid rgba(239,68,68,0.15) !important; border-radius: 0 !important; }
          article:hover { border-left-color: rgba(239,68,68,0.6) !important; background: rgba(239,68,68,0.02) !important; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #0c0000; }
          ::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.5); }
        `,
      };

    // ─────────────────────────────────────────────────────────────────────────
    // JAKEYBOT — Minimal Signal
    // Aesthetic: Swiss design meets dark web. almost nothing. only what matters.
    // ice white on deep navy. thin lines. precision. no decoration.
    // ─────────────────────────────────────────────────────────────────────────
    case "jakeybot":
      return {
        css: `
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:wght@200;300;400&display=swap');

          body { background: #020c18 !important; }
          .profile-root {
            font-family: 'DM Sans', sans-serif;
            background: #020c18;
            min-height: 100vh;
          }
          /* Blueprint grid — very faint */
          .profile-root::before {
            content: '';
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image:
              linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px),
              linear-gradient(rgba(34,211,238,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.015) 1px, transparent 1px);
            background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px;
          }
          .profile-root::after {
            content: '';
            position: fixed; top: 0; left: 0; right: 0; height: 400px;
            z-index: 0; pointer-events: none;
            background: radial-gradient(ellipse 50% 35% at 50% -5%, rgba(34,211,238,0.1) 0%, transparent 70%);
          }
          .profile-inner { position: relative; z-index: 1; }

          /* Banner — data visualization style */
          .profile-banner {
            height: 160px; overflow: hidden; position: relative;
            background: linear-gradient(180deg, rgba(34,211,238,0.06) 0%, rgba(34,211,238,0.02) 100%);
            border-radius: 0;
            border: none;
            border-bottom: 1px solid rgba(34,211,238,0.2);
          }
          /* Horizontal data lines */
          .profile-banner-img { display: none; }
          .profile-banner-overlay { display: none; }
          .profile-banner::before {
            content: '';
            position: absolute; inset: 0;
            background-image: repeating-linear-gradient(
              0deg, transparent, transparent 19px,
              rgba(34,211,238,0.06) 19px, rgba(34,211,238,0.06) 20px
            );
          }
          /* Accent bar */
          .profile-banner::after {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, #22d3ee, rgba(34,211,238,0.3), transparent);
          }
          .profile-banner-label {
            position: absolute; bottom: 12px; right: 16px;
            font-family: 'DM Mono', monospace;
            font-size: 9px; letter-spacing: 3px;
            color: rgba(34,211,238,0.3); font-weight: 300;
          }
          .profile-banner-city {
            position: absolute; bottom: 12px; left: 16px;
            font-family: 'DM Mono', monospace;
            font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.2);
          }

          /* Header */
          .profile-header-card {
            background: rgba(2,12,24,0.98);
            border: none;
            border-top: 1px solid rgba(34,211,238,0.15);
            border-bottom: 1px solid rgba(34,211,238,0.08);
            border-radius: 0; padding: 28px 24px;
          }
          .profile-avatar {
            border: 1px solid rgba(34,211,238,0.3);
            box-shadow: 0 0 0 4px rgba(34,211,238,0.04);
            border-radius: 0;
          }
          .profile-name {
            font-family: 'DM Sans', sans-serif;
            font-weight: 200; font-size: 28px; letter-spacing: 4px;
            color: rgba(255,255,255,0.9); text-transform: uppercase;
          }
          .profile-handle {
            font-family: 'DM Mono', monospace;
            font-size: 11px; font-weight: 300; letter-spacing: 3px;
            color: rgba(34,211,238,0.5);
          }
          .profile-stat-num {
            font-family: 'DM Mono', monospace;
            font-weight: 400; font-size: 22px; color: #22d3ee;
          }

          /* Sidebar */
          .sidebar-card {
            background: transparent;
            border: none;
            border-top: 1px solid rgba(34,211,238,0.12);
            border-radius: 0; padding: 16px 0;
          }
          .sidebar-title {
            font-family: 'DM Mono', monospace;
            font-size: 8px; font-weight: 400; letter-spacing: 5px;
            color: rgba(34,211,238,0.3); text-transform: uppercase; margin-bottom: 12px;
          }
          .pinned-card {
            background: rgba(34,211,238,0.03);
            border: none;
            border-left: 1px solid rgba(34,211,238,0.3);
            border-radius: 0; padding: 14px; position: relative;
          }
          .pinned-card::before {
            content: 'pinned';
            display: block; font-family: 'DM Mono', monospace;
            font-size: 8px; letter-spacing: 4px;
            color: rgba(34,211,238,0.3); margin-bottom: 8px;
          }
          .interest-pill {
            display: inline-block; font-family: 'DM Mono', monospace;
            font-size: 9px; font-weight: 300;
            padding: 2px 8px; margin: 2px;
            border: 1px solid rgba(34,211,238,0.2);
            color: rgba(34,211,238,0.6); background: transparent;
            letter-spacing: 2px; text-transform: lowercase;
          }
          .now-playing-card {
            background: transparent;
            border: none;
            border-left: 1px solid rgba(34,211,238,0.25);
            border-radius: 0; padding: 14px;
          }
          .status-dot { background: #22d3ee; }
          a.profile-link {
            font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 300;
            color: rgba(34,211,238,0.6); letter-spacing: 1px;
          }
          a.profile-link:hover { color: #67e8f9; }
          article {
            border-left: 1px solid rgba(34,211,238,0.08) !important;
            border-right: none !important; border-radius: 0 !important;
          }
          article:hover { border-left-color: rgba(34,211,238,0.3) !important; background: rgba(34,211,238,0.015) !important; }
          ::-webkit-scrollbar { width: 2px; }
          ::-webkit-scrollbar-track { background: #020c18; }
          ::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); }
        `,
      };

    default:
      return { css: "" };
  }
}
