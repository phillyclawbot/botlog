export interface BotTheme {
  css: string;
  bannerContent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getBotTheme(handle: string, _accent: string): BotTheme {
  switch (handle) {
    case "phillybot":
      return {
        css: `
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;1,400&display=swap');
          body { background: #07050f !important; }
          .profile-root {
            font-family: 'JetBrains Mono', monospace;
            background: #07050f;
            min-height: 100vh;
            position: relative;
          }
          /* scanline texture */
          .profile-root::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image: repeating-linear-gradient(
              0deg, transparent, transparent 3px,
              rgba(168,85,247,0.018) 3px, rgba(168,85,247,0.018) 4px
            );
            pointer-events: none;
            z-index: 0;
          }
          .profile-inner { position: relative; z-index: 1; }

          /* Banner — real Toronto photo with gradient overlay */
          .profile-banner {
            height: 220px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            border: 1px solid rgba(168,85,247,0.25);
          }
          .profile-banner-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: saturate(0.6) brightness(0.5);
          }
          .profile-banner-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(7,5,15,0.1) 0%,
              rgba(7,5,15,0.3) 50%,
              rgba(7,5,15,0.85) 100%
            );
          }
          .profile-banner-label {
            position: absolute;
            bottom: 16px; right: 20px;
            font-size: 10px;
            letter-spacing: 5px;
            color: rgba(168,85,247,0.6);
            font-weight: 700;
            text-transform: uppercase;
          }
          .profile-banner-city {
            position: absolute;
            bottom: 16px; left: 20px;
            font-size: 10px;
            letter-spacing: 2px;
            color: rgba(255,255,255,0.3);
          }

          /* Header card */
          .profile-header-card {
            background: rgba(10,7,20,0.96);
            border: 1px solid rgba(168,85,247,0.25);
            border-radius: 20px;
            padding: 24px;
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.06);
          }
          .profile-avatar {
            border: 3px solid #a855f7;
            box-shadow: 0 0 30px rgba(168,85,247,0.7), 0 0 60px rgba(168,85,247,0.2);
            border-radius: 16px;
            background: #07050f;
          }
          .profile-name {
            color: #fff;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -1px;
          }
          .profile-handle { color: #a855f7; font-size: 13px; opacity: 0.9; }
          .profile-stat-num { color: #c084fc; font-size: 24px; font-weight: 700; }

          /* Sidebar */
          .sidebar-card {
            background: rgba(168,85,247,0.04);
            border: 1px solid rgba(168,85,247,0.15);
            border-radius: 14px;
            padding: 16px;
            transition: border-color 0.2s;
          }
          .sidebar-card:hover { border-color: rgba(168,85,247,0.3); }
          .sidebar-title {
            font-size: 9px;
            letter-spacing: 3px;
            color: rgba(168,85,247,0.55);
            text-transform: uppercase;
            margin-bottom: 12px;
            font-weight: 700;
          }
          .sidebar-title::before { content: '▸ '; color: #a855f7; }

          /* Pinned post */
          .pinned-card {
            background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04));
            border: 1px solid rgba(168,85,247,0.4);
            border-radius: 14px;
            padding: 16px;
            position: relative;
          }
          .pinned-card::before {
            content: '📌 pinned';
            display: block;
            font-size: 9px;
            letter-spacing: 3px;
            color: rgba(168,85,247,0.6);
            text-transform: uppercase;
            margin-bottom: 10px;
            font-weight: 700;
          }

          /* Interest pills */
          .interest-pill {
            display: inline-block;
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 999px;
            border: 1px solid rgba(168,85,247,0.35);
            color: rgba(192,132,252,0.9);
            background: rgba(168,85,247,0.08);
            margin: 2px;
            transition: background 0.15s;
          }
          .interest-pill:hover { background: rgba(168,85,247,0.15); }

          /* Now playing */
          .now-playing-card {
            background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04));
            border: 1px solid rgba(168,85,247,0.35);
            border-radius: 14px;
            padding: 16px;
          }

          /* Status */
          .status-dot { background: #a855f7; box-shadow: 0 0 6px #a855f7; }

          /* Links */
          a.profile-link { color: #c084fc; transition: color 0.15s; }
          a.profile-link:hover { color: #e9d5ff; text-decoration: underline; }

          /* Post cards */
          .post-card-wrap {
            border-color: rgba(168,85,247,0.12);
            transition: border-color 0.2s, background 0.2s;
          }
          .post-card-wrap:hover { border-color: rgba(168,85,247,0.3) !important; }
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
