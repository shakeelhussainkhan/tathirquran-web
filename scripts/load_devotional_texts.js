/**
 * Load devotional texts (occasion duas & ziyarat) into Supabase.
 *
 * Source data: scripts/devotional_texts.json — an array of
 *   { slug, title, occasion_tag, arabic_text, translation_text, source_note }
 *
 * CONTENT RULE (Shakeel, standing — this feature lives or dies by it):
 * every entry must be a VERBATIM text from a Shia (Ithna Ashari) source,
 * with that source cited in source_note. No Sunni-sourced content under any
 * label, no AI-written text, no invented translations. translation_text
 * stays null until a verified translation is supplied. An empty JSON array
 * is a valid, honest state: the loader then changes nothing and the app/web
 * simply show no devotional cards.
 *
 * Conventions (same as the other scripts in this repo):
 *   - loads .env.local via dotenv, uses the SERVICE ROLE key (writes to
 *     production — there is no staging DB)
 *   - backs up the existing devotional_texts table to
 *     backups/devotional_texts-backup-<timestamp>.json BEFORE any write
 *   - upserts by slug, so re-running is safe
 *
 * Run (after migration 012_devotional_texts.sql has been applied):
 *   node scripts/load_devotional_texts.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const DATA_FILE = path.resolve(__dirname, "devotional_texts.json");

function validate(entries) {
  const seen = new Set();
  for (const [i, e] of entries.entries()) {
    const where = `entry ${i} (slug: ${e?.slug ?? "?"})`;
    if (!e || typeof e !== "object") throw new Error(`${where}: not an object`);
    if (!e.slug || typeof e.slug !== "string") throw new Error(`${where}: slug is required`);
    if (seen.has(e.slug)) throw new Error(`${where}: duplicate slug`);
    seen.add(e.slug);
    if (!e.title) throw new Error(`${where}: title is required`);
    if (!e.arabic_text) throw new Error(`${where}: arabic_text is required (verbatim Shia source only)`);
    if (!e.source_note) throw new Error(`${where}: source_note is required (cite the verified Shia source)`);
    if (e.translation_text !== null && e.translation_text !== undefined && typeof e.translation_text !== "string") {
      throw new Error(`${where}: translation_text must be a string or null`);
    }
    if (e.occasion_tag !== null && e.occasion_tag !== undefined && typeof e.occasion_tag !== "string") {
      throw new Error(`${where}: occasion_tag must be a string or null`);
    }
  }
}

async function main() {
  const entries = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!Array.isArray(entries)) throw new Error("devotional_texts.json must be a JSON array");
  validate(entries);
  console.log(`Loaded ${entries.length} devotional text(s) from devotional_texts.json`);

  // Backup first — always, before any write (repo convention).
  const { data: existing, error: backupErr } = await supabase
    .from("devotional_texts")
    .select("*")
    .order("id");
  if (backupErr) {
    throw new Error(
      `Could not read devotional_texts (${backupErr.message}). ` +
        `Has migration 012_devotional_texts.sql been applied to this database?`
    );
  }
  const backupDir = path.resolve(__dirname, "../backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `devotional_texts-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existing ?? [], null, 2));
  console.log(`✓ Backup of ${existing?.length ?? 0} existing row(s) written to ${backupPath}`);

  if (entries.length === 0) {
    console.log("Seed file is empty — nothing to load. Content awaits Shakeel's verified texts.");
    return;
  }

  const rows = entries.map((e) => ({
    slug: e.slug,
    title: e.title,
    occasion_tag: e.occasion_tag ?? null,
    arabic_text: e.arabic_text,
    translation_text: e.translation_text ?? null,
    source_note: e.source_note,
  }));

  const { error } = await supabase
    .from("devotional_texts")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw error;

  console.log(`✓ ${rows.length} devotional text(s) upserted by slug.`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message ?? err);
  process.exit(1);
});
