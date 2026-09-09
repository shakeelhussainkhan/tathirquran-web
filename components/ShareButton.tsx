"use client";

interface ShareButtonProps {
  surahNumber: number;
  ayahNumber: number;
}

export default function ShareButton({ surahNumber, ayahNumber }: ShareButtonProps) {
  return (
    <button
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        color: "#c9a227",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: 0,
      }}
      onClick={() => {
        navigator.clipboard?.writeText(
          `${window.location.origin}/ayah/${surahNumber}/${ayahNumber}`
        );
      }}
    >
      Share this ayah →
    </button>
  );
}
