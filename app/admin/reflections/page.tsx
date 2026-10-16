import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReflectionsReviewClient from "./ReflectionsReviewClient";

export const metadata: Metadata = { title: "Reflection Review — TathirQuran Admin" };

/**
 * Reflection review queue.
 *
 * Same localhost-only guard as /admin/permissions: the page itself 404s
 * anywhere else. The real write protection is one layer down — every read
 * and write goes through /api/admin/reflections*, which requires the
 * ADMIN_SECRET (see lib/admin.ts) and fails closed with 503 when it is not
 * set on the server. All interactivity lives in the client component
 * (no inline handlers in Server Components — React #441).
 */
export default async function ReflectionsPage() {
  // Localhost-only guard (same pattern as /admin/permissions)
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (!isLocalhost && process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 24px 80px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "8px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "28px",
            color: "#0d0a04",
            fontWeight: 500,
          }}
        >
          Reflection Review Queue
        </h1>
        <span
          style={{
            fontSize: "11px",
            color: "#7a6030",
            letterSpacing: "0.08em",
            backgroundColor: "#f5f0e8",
            padding: "4px 10px",
            borderRadius: "2px",
          }}
        >
          Admin · Localhost only
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#7a6030", marginBottom: "32px", letterSpacing: "0.04em" }}>
        The reflections below were written by the TathirQuran team with AI assistance and are
        shown to readers as “Reflection — pending scholarly review”. Approving a reflection here
        is a human review decision: only approved reflections drop the “pending” label. Nothing
        here is presented as a quotation from any tafsir.
      </p>

      <ReflectionsReviewClient />
    </main>
  );
}
