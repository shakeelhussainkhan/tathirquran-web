import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { AyahPageData } from "@/types";

/**
 * Share-as-image verse card ("Share the Barakah" style).
 *
 * One layout language shared with the mobile app's ShareVerseCard
 * (tathirquran-app/components/ShareVerseCard.tsx):
 *   parchment background, gold frame bars, Arabic (Uthmani) on top,
 *   translation below, surah:ayah reference, and the
 *   "TathirQuran · tathirquran.com" mark in the footer bar.
 *
 * CONTENT RULE (Shakeel, standing): all TathirQuran text/content is
 * Shia (Ithna Ashari) based. This card therefore shows ONLY the ayah's
 * Arabic text and its translation from the existing Shia translations
 * already in Supabase (the default translation row the caller fetched).
 * No quotations, no tafsir excerpts, no decorative religious text from
 * any outside source is added — the only other text on the card is the
 * surah:ayah reference and the tathirquran.com mark.
 *
 * Verse data is ALWAYS passed in from Supabase queries by the caller —
 * nothing is hardcoded here.
 *
 * RENDERING STACK — why not next/og's ImageResponse:
 * Next 16.3.4 bundles @vercel/og 0.11.1, whose Satori OpenType parser
 * throws "lookupType: 5 - substFormat: 3 is not yet supported" on the
 * GSUB tables of Amiri, Noto Naskh Arabic, Scheherazade New, Lateef,
 * Noto Sans Arabic and Amiri Quran alike (verified locally against the
 * bundled copy, 2026-10-16). This route therefore uses the same
 * Satori → Resvg pipeline that next/og wraps, at current versions
 * (satori 0.33.5 + @resvg/resvg-js) whose parser shapes Amiri
 * correctly — verified by rendering real verses locally and inspecting
 * the PNGs. The existing OG-image routes were NOT touched.
 */

export const VERSE_CARD_SIZE = { width: 1080, height: 1350 };

// ---------------------------------------------------------------------------
// Arabic font (Amiri)
//
// Satori has no system Arabic font, so Arabic renders as boxes unless a
// real Arabic-capable font is embedded. We fetch the Amiri TTFs (the
// same typeface the app uses via @expo-google-fonts/amiri) at runtime
// and hand them to Satori. If every source fails we throw, so the route
// returns an honest 500 instead of a card with broken Arabic.
// ---------------------------------------------------------------------------

type CardFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: "normal" | "italic";
};

const FONT_SOURCES: {
  name: string;
  weight: 400 | 500 | 700;
  style: "normal" | "italic";
  urls: string[];
}[] = [
  {
    name: "Amiri",
    weight: 400,
    style: "normal",
    urls: [
      "https://cdn.jsdelivr.net/fontsource/fonts/amiri@latest/arabic-400-normal.ttf",
      "https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHqUp.ttf",
    ],
  },
  {
    name: "Amiri",
    weight: 700,
    style: "normal",
    urls: [
      "https://cdn.jsdelivr.net/fontsource/fonts/amiri@latest/arabic-700-normal.ttf",
      "https://fonts.gstatic.com/s/amiri/v30/J7acnpd8CGxBHp2VkZY4.ttf",
    ],
  },
  // Latin faces matching the site: Inter for labels, Cormorant Garamond
  // (italic) for the translation — Satori has no system-font fallback.
  {
    name: "Inter",
    weight: 400,
    style: "normal",
    urls: [
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
    ],
  },
  {
    name: "Cormorant Garamond",
    weight: 500,
    style: "italic",
    urls: [
      "https://cdn.jsdelivr.net/fontsource/fonts/cormorant-garamond@latest/latin-500-italic.ttf",
    ],
  },
];

let fontsPromise: Promise<CardFont[]> | null = null;

async function fetchFirst(urls: string[]): Promise<ArrayBuffer> {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.arrayBuffer();
      lastError = new Error(`Font fetch ${url} -> HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("No font sources configured");
}

export function loadVerseCardFonts(): Promise<CardFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONT_SOURCES.map(async ({ name, weight, style, urls }) => ({
        name,
        data: await fetchFirst(urls),
        weight,
        style,
      }))
    ).catch((err) => {
      // Don't cache a failure — a later request may succeed.
      fontsPromise = null;
      throw err;
    });
  }
  return fontsPromise;
}

// ---------------------------------------------------------------------------
// Sizing helpers — long verses shrink instead of overflowing the card.
// ---------------------------------------------------------------------------

function arabicFontSize(text: string): number {
  const len = text.length;
  if (len > 260) return 38;
  if (len > 180) return 44;
  if (len > 120) return 52;
  if (len > 70) return 60;
  return 68;
}

function translationFontSize(text: string): number {
  const len = text.length;
  if (len > 380) return 26;
  if (len > 240) return 30;
  if (len > 140) return 34;
  return 38;
}

/** Cap very long translations at a word boundary so the card stays balanced. */
function fitTranslation(text: string, max = 480): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

const GOLD_BAR =
  "linear-gradient(90deg, transparent 0%, #8b6520 8%, #c9a227 25%, #e8c96a 50%, #c9a227 75%, #8b6520 92%, transparent 100%)";

// ---------------------------------------------------------------------------
// Card rendering
// ---------------------------------------------------------------------------

/** Renders the card and returns PNG bytes. */
export async function renderVerseCard(data: AyahPageData): Promise<Uint8Array> {
  const fonts = await loadVerseCardFonts();

  const { ayah, surah } = data;
  const enTranslation = data.translations.find(
    (t) => t.translation.language_code === "en" && t.translation.is_default
  );
  const translationText = enTranslation ? fitTranslation(enTranslation.text) : "";

  const svg = await satori(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          background: "#faf5e9",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top gold bar */}
        <div style={{ height: "22px", width: "100%", background: GOLD_BAR, display: "flex" }} />

        {/* Inner gold frame */}
        <div
          style={{
            position: "absolute",
            top: "44px",
            left: "36px",
            right: "36px",
            bottom: "44px",
            border: "2px solid rgba(201,162,39,0.45)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "54px",
            left: "46px",
            right: "46px",
            bottom: "54px",
            border: "1px solid rgba(201,162,39,0.25)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 110px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontFamily: "Inter",
              fontSize: "20px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#c9a227",
              marginBottom: "48px",
              display: "flex",
            }}
          >
            TathirQuran
          </div>
          {/* Arabic verse */}
          <div
            style={{
              fontFamily: "Amiri",
              fontWeight: 700,
              fontSize: `${arabicFontSize(ayah.arabic_uthmani)}px`,
              color: "#0d0a04",
              textAlign: "center",
              lineHeight: 1.9,
              direction: "rtl",
              marginBottom: "36px",
              display: "flex",
            }}
          >
            {ayah.arabic_uthmani}
          </div>

          {/* Ornament */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <div style={{ width: "72px", height: "1px", background: "rgba(201,162,39,0.5)", display: "flex" }} />
            <div
              style={{
                width: "11px",
                height: "11px",
                background: "#c9a227",
                transform: "rotate(45deg)",
                display: "flex",
              }}
            />
            <div style={{ width: "72px", height: "1px", background: "rgba(201,162,39,0.5)", display: "flex" }} />
          </div>

          {/* Translation */}
          {translationText && (
            <div
              style={{
                fontFamily: "Cormorant Garamond",
                fontSize: `${translationFontSize(translationText)}px`,
                fontStyle: "italic",
                color: "#2a1f08",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: "36px",
                display: "flex",
              }}
            >
              &ldquo;{translationText}&rdquo;
            </div>
          )}

          {/* Reference — name and number as separate elements: Satori
              collapses the literal space between them when letter-spacing
              is applied, which rendered "AL-FATIHAH1:1". */}
          <div
            style={{
              fontFamily: "Inter",
              fontSize: "22px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c9a227",
              display: "flex",
              flexDirection: "row",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex" }}>{surah.name_transliterated}</div>
            <div style={{ display: "flex" }}>
              {ayah.surah_number}:{ayah.ayah_number}
            </div>
          </div>
        </div>

        {/* Bottom gold bar with domain mark */}
        <div
          style={{
            height: "56px",
            width: "100%",
            background: GOLD_BAR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Inter",
              fontSize: "17px",
              letterSpacing: "0.25em",
              color: "#1a1005",
              textTransform: "uppercase",
            }}
          >
            TathirQuran · tathirquran.com
          </span>
        </div>
      </div>
    ),
    {
      ...VERSE_CARD_SIZE,
      fonts,
    }
  );

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: VERSE_CARD_SIZE.width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();

  return png;
}
