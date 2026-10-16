"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DevotionalText } from "@/types";

interface DevotionalsTodayProps {
  occasionDevotional: DevotionalText | null;
  kumayl: DevotionalText | null;
}

/**
 * Home-page devotional cards (occasion duas & ziyarat).
 *
 * A card appears ONLY when a matching row exists in devotional_texts —
 * if the seed is empty, nothing renders here at all (no placeholder cards).
 *
 * Dua Kumayl rule (web): a simple local-time rule — Thursday from 18:00 in
 * the visitor's own timezone (the eve of Friday). The mobile app applies
 * the precise rule using its calculated Maghrib time; the web has no
 * location, so it uses this stated approximation.
 */
export function isThursdayEveningWeb(now: Date): boolean {
  return now.getDay() === 4 && now.getHours() >= 18;
}

function DevotionalCard({ devotional, label }: { devotional: DevotionalText; label: string }) {
  return (
    <Link
      href={`/devotional/${devotional.slug}`}
      style={{
        display: "block",
        margin: "14px auto 0",
        maxWidth: "560px",
        width: "calc(100% - 40px)",
        border: "0.5px solid rgba(201,162,39,0.45)",
        borderRadius: "4px",
        padding: "14px 20px",
        textAlign: "center",
        textDecoration: "none",
        background: "rgba(201,162,39,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "9px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#9a7830",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "20px",
          color: "#1a1205",
        }}
      >
        {devotional.title} →
      </div>
    </Link>
  );
}

export default function DevotionalsToday({ occasionDevotional, kumayl }: DevotionalsTodayProps) {
  // Thursday-evening is a visitor-local concept; compute it after mount so
  // server and first client render agree (both render no Kumayl card).
  const [showKumayl, setShowKumayl] = useState(false);

  useEffect(() => {
    setShowKumayl(isThursdayEveningWeb(new Date()));
  }, []);

  if (!occasionDevotional && !(kumayl && showKumayl)) return null;

  return (
    <div style={{ width: "100%", paddingBottom: "4px" }}>
      {occasionDevotional && (
        <DevotionalCard devotional={occasionDevotional} label="For today's occasion" />
      )}
      {kumayl && showKumayl && (
        <DevotionalCard devotional={kumayl} label="Thursday evening · Laylat al-Jumu'ah" />
      )}
    </div>
  );
}
