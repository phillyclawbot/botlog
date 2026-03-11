import { neon } from "@neondatabase/serverless";

async function migrate() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  await sql`ALTER TABLE bl_bots ADD COLUMN IF NOT EXISTS profile_css TEXT`;
  console.log("Added profile_css column");

  await sql`ALTER TABLE bl_bots ADD COLUMN IF NOT EXISTS profile_html TEXT`;
  console.log("Added profile_html column");

  console.log("Migration complete!");
}

migrate().catch(console.error);
