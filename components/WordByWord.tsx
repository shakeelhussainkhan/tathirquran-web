"use client";

import { useState } from "react";
import type { AyahWord } from "@/types";

/**
 * Word-by-word view for the ayah page.
 *
 * The words are LEXICAL GLOSSES — dictionary meanings of individual Arabic
 * words (Quran.com API v4 word data, loaded into ayah_words by
 * scripts/load_ayah_words.js). They are NOT tafsir/commentary and NOT a
 * translation of the verse; the panel and strip say so on the page.
 *
 * Behaviour:
 * - Renders the ayah's Arabic exactly as the plain paragraph it replaces.
 * - When `words` is empty (migration 011 / loader not run yet) it renders
 *   ONLY that plain paragraph — no toggle, no strip, no empty shell.
 * - Otherwise a "Word by word" toggle (default OFF) appears under the
 *   Arabic. When ON, the Arabic becomes clickable words; clicking a word
 *   shows its transliteration + gloss in a panel, and a word-by-word strip
 *   (Arabic / transliteration / gloss per row) appears under the ayah.
 */

const ARABIC_STYLE: React.CSSProperties = {
  fontFamily: "'Amiri', serif",
  fontSize: "38px",
  color: "#0d0a04",
  direction: "rtl",
  textAlign: "right",
  lineHeight: 1.8,
  marginBottom: "24px",
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "9px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#7a6030",
};

interface WordByWordProps {
  arabicText: string;
  words: AyahWord[];
}

export default function WordByWord({ arabicText, words }: WordByWordProps) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(0);

  // No word data for this ayah (loader not run): plain Arabic only, and the
  // word-by-word UI is hidden entirely — no fake data, no empty shells.
  if (!words || words.length === 0) {
    return (
      <p style={ARABIC_STYLE} lang="ar" dir="rtl">
        {arabicText}
      </p>
    );
  }

  const ordered = [...words].sort((a, b) => a.position - b.position);
  const current = ordered[Math.min(selected, ordered.length - 1)];

  return (
    <div>
      {show ? (
        <p style={ARABIC_STYLE} lang="ar" dir="rtl">
          {ordered.map((w, i) => (
            <button
              key={w.id ?? w.position}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "38px",
                lineHeight: 1.8,
                color: "#0d0a04",
                background:
                  i === selected ? "rgba(201,162,39,0.22)" : "transparent",
                border: "none",
                borderBottom:
                  i === selected
                    ? "2px solid #c9a227"
                    : "2px solid transparent",
                borderRadius: "6px",
                padding: "0 4px",
                margin: "0 1px",
                cursor: "pointer",
              }}
            >
              {w.arabic_text}
            </button>
          ))}
        </p>
      ) : (
        <p style={ARABIC_STYLE} lang="ar" dir="rtl">
          {arabicText}
        </p>
      )}

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-8px",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-expanded={show}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c9a227",
            background: "transparent",
            border: "0.5px solid rgba(201,162,39,0.45)",
            borderRadius: "999px",
            padding: "6px 14px",
            cursor: "pointer",
          }}
        >
          Word by word {show ? "▾ On" : "▸ Off"}
        </button>
      </div>

      {show && current && (
        <>
          {/* Selected-word panel */}
          <div
            style={{
              border: "0.5px solid rgba(201,162,39,0.35)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "30px",
                color: "#0d0a04",
                lineHeight: 1.6,
                marginBottom: "4px",
              }}
              lang="ar"
              dir="rtl"
            >
              {current.arabic_text}
            </p>
            {current.transliteration && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "17px",
                  fontStyle: "italic",
                  color: "#2a1f08",
                  marginBottom: "2px",
                }}
              >
                {current.transliteration}
              </p>
            )}
            {current.translation_en && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: "#2a1f08",
                }}
              >
                {current.translation_en}
              </p>
            )}
          </div>

          {/* Word-by-word strip */}
          <section style={{ marginBottom: "28px" }}>
            <p style={{ ...LABEL_STYLE, marginBottom: "12px" }}>Word by word</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {ordered.map((w, i) => (
                <button
                  key={w.id ?? w.position}
                  type="button"
                  onClick={() => setSelected(i)}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "16px",
                    width: "100%",
                    textAlign: "left",
                    background:
                      i === selected ? "rgba(201,162,39,0.10)" : "transparent",
                    border: "none",
                    borderBottom: "0.5px solid rgba(201,162,39,0.15)",
                    padding: "8px 6px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: "22px",
                      color: "#0d0a04",
                      minWidth: "110px",
                      textAlign: "right",
                    }}
                    lang="ar"
                    dir="rtl"
                  >
                    {w.arabic_text}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "15px",
                      fontStyle: "italic",
                      color: "#7a6030",
                      minWidth: "110px",
                    }}
                  >
                    {w.transliteration ?? ""}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      color: "#2a1f08",
                      flex: 1,
                    }}
                  >
                    {w.translation_en ?? ""}
                  </span>
                </button>
              ))}
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                color: "#7a6030",
                lineHeight: 1.6,
                marginTop: "12px",
              }}
            >
              Word glosses are the lexical (dictionary) meanings of each word
              on its own — not a translation of the verse and not tafsir.
              Source: Quran.com word data.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
