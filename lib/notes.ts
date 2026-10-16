/**
 * Personal notes & tags — Wave B, Feature 1 (web).
 *
 * Privacy: notes and tags are the visitor's own personal text. They are
 * stored ONLY in this browser's localStorage. They are never sent to
 * Supabase, any API, or any server, and there are no accounts to sync to.
 *
 * Storage keys (same shape as the app):
 *   note_<surah>_<ayah>  — plain-text note (key removed when the note is empty)
 *   tags_<surah>_<ayah>  — JSON array of tag strings (key removed when empty)
 *
 * No sample, placeholder or demo notes/tags are bundled anywhere.
 * All helpers are client-only: they no-op / return empty on the server.
 */

export function noteKey(surah: number, ayah: number): string {
  return `note_${surah}_${ayah}`;
}

export function tagsKey(surah: number, ayah: number): string {
  return `tags_${surah}_${ayah}`;
}

export interface AyahNotesEntry {
  surah: number;
  ayah: number;
  note: string;
  tags: string[];
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is string => typeof t === "string" && t.trim().length > 0
    );
  } catch {
    return [];
  }
}

/** De-duplicate (case-insensitive), trim, and drop empty tags. Order preserved. */
export function normaliseTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const clean = t.trim();
    if (!clean) continue;
    const k = clean.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(clean);
  }
  return out;
}

export function getNote(surah: number, ayah: number): string {
  return storage()?.getItem(noteKey(surah, ayah)) ?? "";
}

export function getTags(surah: number, ayah: number): string[] {
  return parseTags(storage()?.getItem(tagsKey(surah, ayah)) ?? null);
}

/** Saves a note. An empty / whitespace-only note removes the key entirely. */
export function saveNote(surah: number, ayah: number, text: string): void {
  const s = storage();
  if (!s) return;
  const clean = text.trim();
  if (!clean) s.removeItem(noteKey(surah, ayah));
  else s.setItem(noteKey(surah, ayah), clean);
}

export function deleteNote(surah: number, ayah: number): void {
  storage()?.removeItem(noteKey(surah, ayah));
}

/** Saves tags (normalised). An empty list removes the key entirely. */
export function saveTags(surah: number, ayah: number, tags: string[]): void {
  const s = storage();
  if (!s) return;
  const clean = normaliseTags(tags);
  if (clean.length === 0) s.removeItem(tagsKey(surah, ayah));
  else s.setItem(tagsKey(surah, ayah), JSON.stringify(clean));
}

const NOTE_KEY_RE = /^note_(\d+)_(\d+)$/;
const TAGS_KEY_RE = /^tags_(\d+)_(\d+)$/;

/**
 * Lists every ayah that has a note and/or tags, in Quran order.
 * Used by the Archive "My Notes" list.
 */
export function getAllNoteEntries(): AyahNotesEntry[] {
  const s = storage();
  if (!s) return [];
  const byRef = new Map<string, AyahNotesEntry>();
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (!key) continue;
    const noteMatch = key.match(NOTE_KEY_RE);
    const tagsMatch = key.match(TAGS_KEY_RE);
    const m = noteMatch ?? tagsMatch;
    if (!m) continue;
    const surah = parseInt(m[1], 10);
    const ayah = parseInt(m[2], 10);
    const id = `${surah}_${ayah}`;
    const entry = byRef.get(id) ?? { surah, ayah, note: "", tags: [] as string[] };
    const value = s.getItem(key);
    if (noteMatch && value != null) entry.note = value;
    if (tagsMatch) entry.tags = parseTags(value);
    byRef.set(id, entry);
  }
  return [...byRef.values()]
    .filter((e) => e.note.trim().length > 0 || e.tags.length > 0)
    .sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
}

/** Ayahs that have a written note (the "My Notes" filter). */
export function getAyahsWithNotes(): AyahNotesEntry[] {
  return getAllNoteEntries().filter((e) => e.note.trim().length > 0);
}
