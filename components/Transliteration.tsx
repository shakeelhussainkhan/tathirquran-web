"use client";

import { useEffect, useState } from "react";

export const TRANSLITERATION_PREF_KEY = "show_transliteration";

interface TransliterationProps {
  /** Phonetic transcription of the Arabic text (NOT a translation).
   *  When null/empty (not yet loaded), the component renders nothing. */
  text: string | null | undefined;
}

export default function Transliteration({ text }: TransliterationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(localStorage.getItem(TRANSLITERATION_PREF_KEY) === "true");
  }, []);

  if (!text) return null;

  const toggle = () => {
    const next = !show;
    setShow(next);
    localStorage.setItem(TRANSLITERATION_PREF_KEY, String(next));
  };

  return (
    <div style={{ textAlign: "center", marginBottom: "24px" }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={show}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#c9a227",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 8px",
        }}
      >
        Transliteration {show ? "▾" : "▸"}
      </button>
      {show && (
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "18px",
            fontStyle: "italic",
            color: "#2a1f08",
            lineHeight: 1.7,
            textAlign: "center",
            marginTop: "10px",
          }}
          lang="en"
        >
          {text}
        </p>
      )}
    </div>
  );
}
