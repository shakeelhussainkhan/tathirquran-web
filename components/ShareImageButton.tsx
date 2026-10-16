"use client";

import { useState } from "react";

interface ShareImageButtonProps {
  surahNumber: number;
  ayahNumber: number;
}

/**
 * "Share as image" — downloads / shares the illuminated verse card PNG
 * rendered by /api/verse-card/[surah]/[ayah].
 *
 * This is a client component on purpose: Server Components must not carry
 * inline event handlers (that caused production React error #441 — see
 * HANDOVER §5 and components/ShareButton.tsx for the same pattern).
 *
 * Flow: fetch the PNG → Web Share API with file support when available
 * (mobile) → download fallback (desktop / no file-share support).
 */
export default function ShareImageButton({
  surahNumber,
  ayahNumber,
}: ShareImageButtonProps) {
  const [label, setLabel] = useState("Share as image");
  const [busy, setBusy] = useState(false);

  const flash = (text: string) => {
    setLabel(text);
    setTimeout(() => setLabel("Share as image"), 2500);
  };

  const handleShareImage = async () => {
    if (busy) return;
    setBusy(true);
    setLabel("Preparing card…");
    const filename = `tathirquran-${surahNumber}-${ayahNumber}.png`;
    try {
      const res = await fetch(`/api/verse-card/${surahNumber}/${ayahNumber}`);
      if (!res.ok) throw new Error(`Card request failed: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: "TathirQuran",
            text: `Quran ${surahNumber}:${ayahNumber} — tathirquran.com`,
          });
          flash("Shared ✓");
          return;
        } catch (err) {
          // User cancelled the share sheet — don't fall through to download.
          if (err instanceof DOMException && err.name === "AbortError") {
            setLabel("Share as image");
            return;
          }
          // Any other share failure: fall through to the download fallback.
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      flash("Card saved ✓");
    } catch {
      flash("Could not make card");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShareImage}
      disabled={busy}
      aria-label={`Share Quran ${surahNumber}:${ayahNumber} as an image card`}
      style={{
        background: "none",
        border: "none",
        cursor: busy ? "wait" : "pointer",
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        color: "#c9a227",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: 0,
        opacity: busy ? 0.6 : 1,
      }}
    >
      🖼 {label}
    </button>
  );
}
