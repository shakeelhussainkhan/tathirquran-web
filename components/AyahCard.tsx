import type { TodayAyahResponse } from "@/types";

interface AyahCardProps {
  data: TodayAyahResponse;
}

export default function AyahCard({ data }: AyahCardProps) {
  return (
    <p className="arabic-hero" lang="ar" dir="rtl">
      {data.ayah.arabic_uthmani}
    </p>
  );
}
