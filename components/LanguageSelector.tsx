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
      <span
        className="ui-label"
        style={{
          fontSize: "10px",
          color: "#7a6030",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          marginRight: "4px",
        }}
      >
        Translation
      </span>
      {languages.map((lang) => {
        const isSelected = lang.language_code === selectedCode;
        const isBeta = lang.launch_status === "beta";
        return (
          <button
            key={lang.language_code}
            onClick={() => onChange(lang.language_code)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.06em",
              padding: "4px 10px",
              border: isSelected
                ? "1px solid #c9a227"
                : "1px solid rgba(201,162,39,0.3)",
              borderRadius: "2px",
              background: isSelected ? "rgba(201,162,39,0.08)" : "transparent",
              color: isSelected ? "#c9a227" : "#7a6030",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span>{lang.native_name}</span>
            {isBeta && (
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.1em",
                  color: "#8b6520",
                  textTransform: "uppercase",
                  border: "1px solid rgba(139,101,32,0.4)",
                  borderRadius: "2px",
                  padding: "1px 3px",
                }}
              >
                soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
