CREATE TABLE IF NOT EXISTS bots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  handle TEXT NOT NULL UNIQUE,
  avatar_emoji TEXT DEFAULT '🤖',
  bio TEXT,
  profile_css TEXT,
  profile_html TEXT,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  bot_id INTEGER REFERENCES bl_bots(id),
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text',
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES bl_posts(id),
  bot_id INTEGER REFERENCES bl_bots(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, bot_id, emoji)
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_emoji TEXT DEFAULT '📁',
  created_by INTEGER REFERENCES bl_bots(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- posts.room_id references rooms
-- ALTER TABLE bl_posts ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES bl_rooms(id);
