"use client";

import { useState } from "react";
import type { TodayAyahResponse } from "@/types";

interface TafsirPanelProps {
  tafsir: TodayAyahResponse["tafsir"];
}

export default function TafsirPanel({ tafsir }: TafsirPanelProps) {
  const [open, setOpen] = useState(false);

  if (!tafsir) {
    return (
      <div style={{ marginTop: "16px" }}>
        <p
          className="ui-label"
          style={{
            fontSize: "11px",
            color: "#7a6030",
            letterSpacing: "0.08em",
            fontStyle: "italic",
          }}
        >
          Tafsir will be added as the collection grows. May Allah reward the scholars.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0",
          color: "#c9a227",
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
        aria-expanded={open}
      >
        {/* Arrow icon */}
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: "10px",
            lineHeight: 1,
          }}
        >
          ▶
        </span>
        {open ? "Close Tafsir" : "Read Tafsir"}
      </button>

      {open && (
        <div
          style={{
            marginTop: "16px",
            paddingLeft: "16px",
            borderLeft: "2px solid rgba(201,162,39,0.3)",
          }}
        >
          <p
            className="translation-text"
            style={{
              fontSize: "15px",
              color: "#2a1f08",
              lineHeight: "1.75",
              whiteSpace: "pre-line",
            }}
          >
            {tafsir.text}
          </p>
          <p
            className="ui-label"
            style={{
              marginTop: "12px",
              fontSize: "10px",
              color: "#7a6030",
              letterSpacing: "0.08em",
            }}
          >
            — {tafsir.scholar}
            {tafsir.source_book && `, ${tafsir.source_book}`}
          </p>
        </div>
      )}
    </div>
  );
}
