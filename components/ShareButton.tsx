"use client";

interface ShareButtonProps {
  surahNumber: number;
  ayahNumber: number;
  arabicText?: string;
  translationText?: string;
}

export default function ShareButton({
  surahNumber,
  ayahNumber,
  arabicText,
  translationText,
}: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const url = `https://tathirquran.com/ayah/${surahNumber}/${ayahNumber}`;
    const text = arabicText
      ? `${arabicText}\n\n"${translationText}"\n\n${url}`
      : url;

    if (navigator.share) {
      try {
        await navigator.share({ title: "TathirQuran", text, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard?.writeText(text);
    const btn = e.currentTarget;
    const original = btn.textContent;
    btn.textContent = "COPIED ✓";
    setTimeout(() => {
      btn.textContent = original;
    }, 2000);
  };

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
      onClick={handleShare}
    >
      Share this ayah →
    </button>
  );
}
