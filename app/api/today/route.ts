import { NextResponse } from "next/server";
import { getTodayAyahData } from "@/lib/queries";

export const revalidate = 3600; // 1 hour ISR

export async function GET() {
  try {
    const data = await getTodayAyahData();

    if (!data) {
      return NextResponse.json(
        { error: "No ayah scheduled for today." },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("/api/today error:", err);
    return NextResponse.json(
      { error: "Failed to fetch today's ayah." },
      { status: 500 }
    );
  }
}
