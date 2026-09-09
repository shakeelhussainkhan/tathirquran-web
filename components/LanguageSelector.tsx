"use client";

import type { Language } from "@/types";

interface LanguageSelectorProps {
  languages: Language[];
  selectedCode: string;
  onChange: (code: string) => void;
}

export default function LanguageSelector({
  languages,
  selectedCode,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      {languages.map((lang) => {
        const isSelected = lang.language_code === selectedCode;
        const isSoon = lang.launch_status === "beta" || lang.launch_status === "pending";
        return (
          <button
            key={lang.language_code}
            onClick={() => onChange(lang.language_code)}
            disabled={isSoon}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              border: isSelected ? "none" : "0.5px solid rgba(201,162,39,.35)",
              borderRadius: "2px",
              background: isSelected ? "#c9a227" : "transparent",
              color: isSelected ? "#fff" : "#9a7020",
              cursor: isSoon ? "default" : "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: isSoon ? 0.75 : 1,
            }}
          >
            <span>{lang.language_name}</span>
            {isSoon && (
              <sup
                style={{
                  fontSize: "6px",
                  letterSpacing: "0.08em",
                  color: "#c9a227",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                soon
              </sup>
            )}
          </button>
        );
      })}
    </div>
  );
}
