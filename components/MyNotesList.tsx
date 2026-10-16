"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllNoteEntries, type AyahNotesEntry } from "@/lib/notes";

/**
 * "My Notes" list for the Archive page. Notes live in this browser's
 * localStorage, so this list can only be built client-side. It shows an
 * honest empty state when the visitor has not written any notes yet —
 * there is no bundled sample content.
 */
export default function MyNotesList() {
  const [entries, setEntries] = useState<AyahNotesEntry[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setEntries(getAllNoteEntries());
  }, []);

  if (entries === null) return null;

  const withNotes = entries.filter((e) => e.note.trim().length > 0);
  const visible = showAll ? entries : withNotes;

  return (
    <section style={{ marginTop: "48px" }}>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "22px",
          fontWeight: 400,
          color: "#0d0a04",
          marginBottom: "4px",
        }}
      >
        My Notes
      </h2>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          color: "#7a6030",
          letterSpacing: "0.06em",
          marginBottom: "20px",
        }}
      >
        Your personal notes, stored only in this browser
      </p>

      {entries.length === 0 ? (
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "#7a6030",
            fontSize: "16px",
          }}
        >
          No notes yet. Open any ayah and write a note on it — it stays in
          this browser only.
        </p>
      ) : (
        <>
          {visible.length === 0 ? (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                color: "#7a6030",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              No ayahs with written notes yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {visible.map((e) => (
                <Link
                  key={`${e.surah}_${e.ayah}`}
                  href={`/ayah/${e.surah}/${e.ayah}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      padding: "12px 0",
                      borderBottom: "0.5px solid rgba(201,162,39,0.12)",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        color: "#c9a227",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Quran {e.surah}:{e.ayah}
                    </p>
                    {e.note && (
                      <p
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "16px",
                          color: "#2a1f08",
                          lineHeight: 1.6,
                          marginBottom: e.tags.length > 0 ? "6px" : "0",
                        }}
                      >
                        {e.note}
                      </p>
                    )}
                    {e.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {e.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              border: "0.5px solid rgba(201,162,39,0.4)",
                              borderRadius: "10px",
                              padding: "2px 9px",
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "11px",
                              color: "#7a6030",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {entries.length !== withNotes.length && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#c9a227",
                padding: 0,
                marginTop: "16px",
              }}
            >
              {showAll ? "Show only ayahs with notes" : "Show ayahs with tags only too"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
