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
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
      {languages.map((lang) => {
        const isSelected = lang.language_code === selectedCode;
        const isSoon = lang.launch_status === "beta" || lang.launch_status === "pending";
        return (
          <button
            key={lang.language_code}
            onClick={() => !isSoon && onChange(lang.language_code)}
            disabled={isSoon}
            className={isSelected ? "lang-pill-active" : "lang-pill-inactive"}
            style={{ opacity: isSoon ? 0.75 : 1, display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span>{lang.language_name}</span>
            {isSoon && (
              <sup
                style={{
                  fontSize: "6px",
                  letterSpacing: "0.08em",
                  color: isSelected ? "rgba(255,255,255,.7)" : "#c9a227",
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
