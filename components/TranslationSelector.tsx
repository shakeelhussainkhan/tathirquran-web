"use client";

import type { Translation } from "@/types";

interface TranslationSelectorProps {
  translations: Translation[];
  selectedId: number | null;
  onChange: (id: number) => void;
}

export default function TranslationSelector({
  translations,
  selectedId,
  onChange,
}: TranslationSelectorProps) {
  if (translations.length <= 1) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          color: "#7a6030",
          background: "transparent",
          border: "1px solid rgba(201,162,39,0.3)",
          borderRadius: "2px",
          padding: "4px 8px",
          cursor: "pointer",
          outline: "none",
          letterSpacing: "0.04em",
        }}
        aria-label="Select translation"
      >
        {translations.map((t) => (
          <option key={t.translation_id} value={t.translation_id}>
            {t.scholar_name}
            {t.is_placeholder ? " (placeholder)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
