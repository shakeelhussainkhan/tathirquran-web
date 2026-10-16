"use client";

import { useEffect, useState } from "react";
import { getNote, getTags, saveNote, saveTags, deleteNote } from "@/lib/notes";

interface NoteTagsProps {
  surahNumber: number;
  ayahNumber: number;
}

/**
 * Add / edit a personal note and manage tags for one ayah.
 * Stored only in this browser's localStorage (see lib/notes.ts) — notes
 * never leave the device. No bundled sample notes or tags.
 */
export default function NoteTags({ surahNumber, ayahNumber }: NoteTagsProps) {
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const n = getNote(surahNumber, ayahNumber);
    setNote(n);
    setSavedNote(n);
    setTags(getTags(surahNumber, ayahNumber));
    setTagDraft("");
    setStatus("");
  }, [surahNumber, ayahNumber]);

  const dirty = note.trim() !== savedNote;

  const handleSaveNote = () => {
    saveNote(surahNumber, ayahNumber, note);
    const clean = note.trim();
    setNote(clean);
    setSavedNote(clean);
    setStatus(clean ? "Note saved in this browser" : "Note removed");
  };

  const handleDeleteNote = () => {
    deleteNote(surahNumber, ayahNumber);
    setNote("");
    setSavedNote("");
    setStatus("Note removed");
  };

  const addTag = () => {
    const clean = tagDraft.trim();
    if (!clean) return;
    setTagDraft("");
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) return;
    const next = [...tags, clean];
    setTags(next);
    saveTags(surahNumber, ayahNumber, next);
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    saveTags(surahNumber, ayahNumber, next);
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "9px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#7a6030",
    marginBottom: "10px",
  };
  const btnStyle: React.CSSProperties = {
    background: "none",
    border: "0.5px solid rgba(201,162,39,0.4)",
    borderRadius: "2px",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8b6520",
    padding: "6px 12px",
  };

  return (
    <section
      style={{
        marginBottom: "32px",
        border: "0.5px solid rgba(201,162,39,0.25)",
        borderRadius: "4px",
        padding: "18px",
        background: "rgba(201,162,39,0.04)",
      }}
    >
      <p style={labelStyle}>My Note</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your own note on this ayah…"
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#2a1f08",
          background: "transparent",
          border: "0.5px solid rgba(201,162,39,0.3)",
          borderRadius: "2px",
          padding: "10px",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
        <button type="button" style={{ ...btnStyle, opacity: dirty ? 1 : 0.5 }} onClick={handleSaveNote} disabled={!dirty}>
          {savedNote ? "Save note" : "Add note"}
        </button>
        {savedNote && (
          <button type="button" style={btnStyle} onClick={handleDeleteNote}>
            Delete
          </button>
        )}
        {status && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#c9a227" }}>{status}</span>
        )}
      </div>

      <p style={{ ...labelStyle, marginTop: "20px" }}>Tags</p>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              title="Remove tag"
              style={{
                border: "0.5px solid rgba(201,162,39,0.4)",
                borderRadius: "10px",
                background: "none",
                cursor: "pointer",
                padding: "3px 10px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "#2a1f08",
              }}
            >
              {tag} ×
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag"
          style={{
            flex: 1,
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            color: "#2a1f08",
            background: "transparent",
            border: "0.5px solid rgba(201,162,39,0.3)",
            borderRadius: "2px",
            padding: "7px 10px",
          }}
        />
        <button type="button" style={btnStyle} onClick={addTag}>
          Add tag
        </button>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontStyle: "italic", color: "#7a6030", marginTop: "12px" }}>
        Your notes and tags are stored only in this browser and never leave your device.
      </p>
    </section>
  );
}
