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
      <button className="tafsir-toggle" disabled style={{ opacity: 0.5, cursor: "default" }}>
        READ TAFSIR ↓
      </button>
    );
  }

  return (
    <div>
      <button
        className="tafsir-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "CLOSE TAFSIR ↑" : "READ TAFSIR ↓"}
      </button>

      {open && (
        <div
          style={{
            paddingTop: "12px",
            borderTop: "0.5px solid rgba(201,162,39,.1)",
            marginTop: "8px",
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "14px",
              fontStyle: "italic",
              color: "#2a1f08",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
            }}
          >
            {tafsir.text}
          </p>
          <p
            style={{
              marginTop: "10px",
              fontFamily: "'Inter', sans-serif",
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
