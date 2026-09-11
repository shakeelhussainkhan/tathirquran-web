"use client";

import { useState } from "react";
import type { Tafsir } from "@/types";

const SCHOLAR_CONFIG: Record<string, { label: string; sublabel: string }> = {
  "Allamah Tabataba'i": {
    label: "Al-Mizan",
    sublabel: "Allamah Tabataba'i (RA)",
  },
  "Ahlul Bayt (AS)": {
    label: "From the Ahlul Bayt (AS)",
    sublabel: "Tafsir al-Burhan — Narrations of the Imams",
  },
  "Ayatollah Makarem Shirazi": {
    label: "Tafsir Nemouneh",
    sublabel: "Ayatollah Makarem Shirazi",
  },
};

const SCHOLAR_ORDER = [
  "Allamah Tabataba'i",
  "Ahlul Bayt (AS)",
  "Ayatollah Makarem Shirazi",
];

interface TafsirPanelProps {
  tafsirEntries: Tafsir[];
}

export default function TafsirPanel({ tafsirEntries }: TafsirPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggle = (scholar: string) => {
    setOpenSections((prev) => ({ ...prev, [scholar]: !prev[scholar] }));
  };

  if (!tafsirEntries || tafsirEntries.length === 0) {
    return (
      <div style={{ marginTop: 8 }}>
        <button className="w4-tafsir-btn" disabled style={{ opacity: 0.5, cursor: "default" }}>
          TAFSIR BEING ADDED — CHECK BACK SOON
        </button>
      </div>
    );
  }

  // Group by scholar
  const grouped: Record<string, Tafsir[]> = {};
  tafsirEntries.forEach((t) => {
    if (!grouped[t.scholar]) grouped[t.scholar] = [];
    grouped[t.scholar].push(t);
  });

  const scholars = [
    ...SCHOLAR_ORDER.filter((s) => grouped[s]),
    ...Object.keys(grouped).filter((s) => !SCHOLAR_ORDER.includes(s)),
  ];

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {scholars.map((scholar) => {
        const config = SCHOLAR_CONFIG[scholar];
        const entries = grouped[scholar];
        const isOpen = openSections[scholar];

        return (
          <div key={scholar}>
            <button
              className="w4-tafsir-btn"
              onClick={() => toggle(scholar)}
              aria-expanded={isOpen}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span>
                {config?.label || scholar}
                {config?.sublabel && (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 9,
                      color: "rgba(139,101,32,0.6)",
                      marginLeft: 8,
                      letterSpacing: "0.04em",
                      textTransform: "none",
                      fontWeight: 300,
                    }}
                  >
                    {config.sublabel}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, marginLeft: 8, flexShrink: 0 }}>
                {isOpen ? "↑" : "↓"}
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(201,162,39,0.04)",
                  borderLeft: "2px solid rgba(201,162,39,0.3)",
                  marginTop: 4,
                  borderRadius: "0 2px 2px 0",
                }}
              >
                {entries.map((entry, i) => (
                  <div key={entry.id}>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16,
                        fontStyle: "italic",
                        color: "#2a1f08",
                        lineHeight: 1.75,
                        margin: 0,
                      }}
                    >
                      {entry.text}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        color: "#9a7830",
                        letterSpacing: "0.06em",
                        marginTop: 10,
                        marginBottom: i < entries.length - 1 ? 16 : 0,
                      }}
                    >
                      — {entry.source_book}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
