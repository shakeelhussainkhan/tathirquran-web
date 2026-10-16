"use client";

import { useCallback, useEffect, useState } from "react";

type ReviewStatus = "pending" | "approved" | "needs_edit";

interface ReflectionItem {
  id: number;
  ayah_id: number;
  surah_number: number | null;
  ayah_number: number | null;
  surah_name_english: string | null;
  surah_name_transliterated: string | null;
  arabic_uthmani: string | null;
  translation_text: string | null;
  text: string;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

const SECRET_KEY = "tathir_admin_secret";
const REVIEWER_KEY = "tathir_admin_reviewer";

const STATUS_TABS: { key: ReviewStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "needs_edit", label: "Needs edit" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#c9a227",
  approved: "#4a8c4a",
  needs_edit: "#8c4a4a",
};

export default function ReflectionsReviewClient() {
  const [secret, setSecret] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [items, setItems] = useState<ReflectionItem[]>([]);
  const [migrationPending, setMigrationPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Restore the secret/reviewer for this browser session only.
  useEffect(() => {
    const savedSecret = sessionStorage.getItem(SECRET_KEY);
    const savedReviewer = sessionStorage.getItem(REVIEWER_KEY);
    if (savedSecret) {
      setSecret(savedSecret);
      setConnected(true);
    }
    if (savedReviewer) setReviewer(savedReviewer);
  }, []);

  const load = useCallback(
    async (status: ReviewStatus, adminSecret: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reflections?status=${status}`, {
          headers: { "x-admin-secret": adminSecret },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setItems([]);
          setError(data.error ?? `Request failed (${res.status}).`);
          if (res.status === 401) setConnected(false);
          return false;
        }
        setItems((data.reflections ?? []) as ReflectionItem[]);
        setMigrationPending(Boolean(data.migrationPending));
        return true;
      } catch {
        setItems([]);
        setError("Could not reach the admin API.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (connected && secret) void load(tab, secret);
  }, [connected, secret, tab, load]);

  const handleConnect = async () => {
    setError(null);
    setNotice(null);
    if (!secret.trim()) {
      setError("Enter the admin secret first.");
      return;
    }
    sessionStorage.setItem(SECRET_KEY, secret);
    if (reviewer.trim()) sessionStorage.setItem(REVIEWER_KEY, reviewer.trim());
    const ok = await load(tab, secret);
    if (ok) setConnected(true);
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem(SECRET_KEY);
    setSecret("");
    setConnected(false);
    setItems([]);
    setError(null);
    setNotice(null);
  };

  const act = async (
    item: ReflectionItem,
    action: "approve" | "edit_approve" | "reject"
  ) => {
    setError(null);
    setNotice(null);
    if (!reviewer.trim()) {
      setError("Enter your name or initials (Reviewer field) before reviewing — it is recorded with each decision.");
      return;
    }
    sessionStorage.setItem(REVIEWER_KEY, reviewer.trim());
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/reflections/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          action,
          reviewed_by: reviewer.trim(),
          ...(action === "edit_approve" ? { text: editText } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      setEditingId(null);
      setEditText("");
      setNotice(
        action === "reject"
          ? `Reflection for ${item.surah_name_english ?? "ayah"} ${item.surah_number ?? ""}:${item.ayah_number ?? ""} marked as needs edit.`
          : `Reflection for ${item.surah_name_english ?? "ayah"} ${item.surah_number ?? ""}:${item.ayah_number ?? ""} approved.`
      );
      await load(tab, secret);
    } catch {
      setError("Could not reach the admin API.");
    } finally {
      setBusyId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    fontSize: "13px",
    padding: "8px 10px",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "2px",
    backgroundColor: "#fffdf8",
    color: "#0d0a04",
    fontFamily: "'Inter', sans-serif",
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "8px 14px",
    borderRadius: "2px",
    border: "1px solid rgba(201,162,39,0.5)",
    backgroundColor: "#f5f0e8",
    color: "#7a6030",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div>
      {/* Credentials */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          backgroundColor: "#f5f0e8",
          border: "1px solid rgba(201,162,39,0.2)",
          borderRadius: "2px",
          padding: "14px 16px",
          marginBottom: "24px",
        }}
      >
        <input
          type="password"
          placeholder="Admin secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          style={{ ...inputStyle, minWidth: "220px" }}
          autoComplete="off"
        />
        <input
          type="text"
          placeholder="Your name / initials (recorded as reviewer)"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          style={{ ...inputStyle, minWidth: "260px" }}
        />
        {!connected ? (
          <button type="button" onClick={handleConnect} style={buttonStyle}>
            Connect
          </button>
        ) : (
          <button type="button" onClick={handleDisconnect} style={buttonStyle}>
            Disconnect
          </button>
        )}
        {connected && (
          <span style={{ fontSize: "11px", color: "#4a8c4a", letterSpacing: "0.06em" }}>
            Connected for this browser session
          </span>
        )}
      </div>

      {migrationPending && (
        <p
          style={{
            fontSize: "12px",
            color: "#8b6520",
            backgroundColor: "#fdf6e0",
            border: "1px solid rgba(201,162,39,0.4)",
            borderRadius: "2px",
            padding: "10px 14px",
            marginBottom: "16px",
          }}
        >
          Migration 013 has not been run on this database yet, so every reflection is shown as
          pending and review actions are disabled server-side until it is.
        </p>
      )}

      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#8c4a4a",
            backgroundColor: "#fbeaea",
            border: "1px solid rgba(140,74,74,0.35)",
            borderRadius: "2px",
            padding: "10px 14px",
            marginBottom: "16px",
          }}
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          style={{
            fontSize: "12px",
            color: "#4a8c4a",
            backgroundColor: "#edf5ed",
            border: "1px solid rgba(74,140,74,0.35)",
            borderRadius: "2px",
            padding: "10px 14px",
            marginBottom: "16px",
          }}
        >
          {notice}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              ...buttonStyle,
              backgroundColor: tab === t.key ? "#0d0a04" : "#f5f0e8",
              color: tab === t.key ? "#f5f0e8" : "#7a6030",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ fontSize: "13px", color: "#7a6030" }}>Loading…</p>}

      {!loading && connected && items.length === 0 && !error && (
        <p
          style={{
            fontStyle: "italic",
            color: "#7a6030",
            fontSize: "15px",
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {tab === "pending"
            ? "No reflections are waiting for review."
            : tab === "approved"
              ? "No reflections have been approved yet."
              : "No reflections are marked as needing edits."}
        </p>
      )}

      {!loading &&
        items.map((item) => {
          const isBusy = busyId === item.id;
          const isEditing = editingId === item.id;
          const reference =
            item.surah_number !== null && item.ayah_number !== null
              ? `${item.surah_name_english ?? item.surah_name_transliterated ?? "Surah"} ${item.surah_number}:${item.ayah_number}`
              : `Ayah #${item.ayah_id}`;
          return (
            <article
              key={item.id}
              style={{
                border: "1px solid rgba(201,162,39,0.25)",
                borderRadius: "2px",
                padding: "18px 20px",
                marginBottom: "16px",
                backgroundColor: "#fffdf8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "10px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "20px",
                    color: "#0d0a04",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {reference}
                </h2>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: STATUS_COLORS[item.review_status] ?? "#7a6030",
                    border: `1px solid ${STATUS_COLORS[item.review_status] ?? "#7a6030"}55`,
                    borderRadius: "2px",
                    padding: "2px 8px",
                  }}
                >
                  {item.review_status === "needs_edit"
                    ? "Needs edit"
                    : item.review_status === "approved"
                      ? "Approved"
                      : "Pending review"}
                </span>
              </div>

              {item.reviewed_by && (
                <p style={{ fontSize: "11px", color: "#7a6030", marginBottom: "10px" }}>
                  Reviewed by {item.reviewed_by}
                  {item.reviewed_at
                    ? ` · ${new Date(item.reviewed_at).toLocaleString()}`
                    : ""}
                </p>
              )}

              {item.arabic_uthmani && (
                <p
                  dir="rtl"
                  lang="ar"
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: "24px",
                    lineHeight: 1.9,
                    color: "#0d0a04",
                    textAlign: "right",
                    marginBottom: "10px",
                  }}
                >
                  {item.arabic_uthmani}
                </p>
              )}

              {item.translation_text && (
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px",
                    color: "#2a1f08",
                    lineHeight: 1.6,
                    marginBottom: "12px",
                  }}
                >
                  {item.translation_text}
                </p>
              )}

              <div
                style={{
                  borderLeft: "2px solid rgba(201,162,39,0.3)",
                  paddingLeft: "14px",
                  marginBottom: "14px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#7a6030",
                    marginBottom: "6px",
                  }}
                >
                  {item.review_status === "approved"
                    ? "Reflection"
                    : "Reflection — pending scholarly review"}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px",
                    fontStyle: "italic",
                    color: "#2a1f08",
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>

              {tab === "pending" && (
                <div>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={8}
                        style={{
                          ...inputStyle,
                          width: "100%",
                          lineHeight: 1.6,
                          marginBottom: "10px",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => act(item, "edit_approve")}
                          style={buttonStyle}
                        >
                          {isBusy ? "Saving…" : "Save edits & approve"}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                          style={buttonStyle}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => act(item, "approve")}
                        style={buttonStyle}
                      >
                        {isBusy ? "Saving…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setEditingId(item.id);
                          setEditText(item.text);
                        }}
                        style={buttonStyle}
                      >
                        Edit &amp; approve
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => act(item, "reject")}
                        style={{
                          ...buttonStyle,
                          color: "#8c4a4a",
                          borderColor: "rgba(140,74,74,0.5)",
                        }}
                      >
                        {isBusy ? "Saving…" : "Reject (needs edit)"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
    </div>
  );
}
