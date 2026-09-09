import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPermissionRequests } from "@/lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Permissions Admin — TathirQuran" };

const STATUS_COLORS: Record<string, string> = {
  draft: "#7a6030",
  sent: "#c9a227",
  responded: "#8b6520",
  approved: "#4a8c4a",
  declined: "#8c4a4a",
};

export default async function PermissionsPage() {
  // Localhost-only guard
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (!isLocalhost && process.env.NODE_ENV !== "development") {
    notFound();
  }

  const requests = await getPermissionRequests();

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#0d0a04", fontWeight: 500 }}>
          Translation Permission Requests
        </h1>
        <span style={{ fontSize: "11px", color: "#7a6030", letterSpacing: "0.08em", backgroundColor: "#f5f0e8", padding: "4px 10px", borderRadius: "2px" }}>
          Admin · Localhost only
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#7a6030", marginBottom: "32px", letterSpacing: "0.04em" }}>
        Tracks outreach to scholars for Shia translation permissions across all supported languages.
      </p>

      {/* Summary counts */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
        {(["sent", "responded", "approved", "declined", "draft"] as const).map((status) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <div key={status} style={{ backgroundColor: "#f5f0e8", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "2px", padding: "10px 16px", minWidth: "80px" }}>
              <p style={{ fontSize: "20px", color: STATUS_COLORS[status] ?? "#7a6030", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{count}</p>
              <p style={{ fontSize: "10px", color: "#7a6030", letterSpacing: "0.10em", textTransform: "uppercase" }}>{status}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.3)" }}>
              {["Scholar", "Institution", "Language", "Sent", "Status", "Notes"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "10px", color: "#7a6030", letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(201,162,39,0.1)" }}>
                <td style={{ padding: "12px", fontSize: "16px", color: "#0d0a04", fontFamily: "'Cormorant Garamond', serif" }}>{r.scholar_name}</td>
                <td style={{ padding: "12px", fontSize: "12px", color: "#2a1f08" }}>{r.institution ?? "—"}</td>
                <td style={{ padding: "12px", fontSize: "11px", color: "#c9a227", letterSpacing: "0.10em", textTransform: "uppercase" }}>{r.language_code ?? "—"}</td>
                <td style={{ padding: "12px", fontSize: "12px", color: "#7a6030" }}>{r.sent_date ?? "—"}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: STATUS_COLORS[r.status] ?? "#7a6030", border: `1px solid ${STATUS_COLORS[r.status] ?? "#7a6030"}33`, borderRadius: "2px", padding: "2px 8px" }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: "12px", fontSize: "12px", color: "#7a6030", maxWidth: "240px" }}>{r.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <p style={{ fontStyle: "italic", color: "#7a6030", fontSize: "15px", fontFamily: "'Cormorant Garamond', serif", marginTop: "24px" }}>
          No permission requests found. Run the seed script to populate initial entries.
        </p>
      )}
    </main>
  );
}
