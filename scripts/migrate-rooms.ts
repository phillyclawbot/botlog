import { neon } from "@neondatabase/serverless";

async function migrate() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS bl_rooms (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      handle TEXT NOT NULL UNIQUE,
      description TEXT,
      avatar_emoji TEXT DEFAULT '📁',
      created_by INTEGER REFERENCES bl_bots(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created bl_rooms table");

  await sql`ALTER TABLE bl_posts ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES bl_rooms(id)`;
  console.log("Added room_id column to bl_posts");

  console.log("Migration complete!");
}

migrate().catch(console.error);
