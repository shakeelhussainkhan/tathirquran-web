"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SearchResponse, SearchResult } from "@/types";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

/** Returns a window of `text` centred on the first case-insensitive match. */
function snippetAround(text: string, query: string, radius = 110): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

/** Renders text with every case-insensitive occurrence of `query` bolded. */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (;;) {
    const idx = lower.indexOf(needle, cursor);
    if (idx === -1) break;
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <strong key={key++} style={{ color: "#8b6520" }}>
        {text.slice(idx, idx + query.length)}
      </strong>
    );
    cursor = idx + query.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function ResultCard({ result, query }: { result: SearchResult; query: string }) {
  const ref = `${result.surah_name_transliterated || result.surah_name_english} ${result.surah_number}:${result.ayah_number}`;
  const arabicMatched = result.matched_in.includes("arabic");

  return (
    <Link
      href={`/ayah/${result.surah_number}/${result.ayah_number}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          border: "0.5px solid rgba(201,162,39,0.25)",
          borderRadius: "4px",
          padding: "18px 20px",
          background: "rgba(255,255,255,0.35)",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c9a227",
            marginBottom: "10px",
          }}
        >
          {ref}
          {result.surah_name_english
            ? ` · ${result.surah_name_english}`
            : ""}
        </p>

        <p
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "22px",
            color: "#0d0a04",
            direction: "rtl",
            textAlign: "right",
            lineHeight: 1.8,
            marginBottom: "12px",
          }}
          lang="ar"
          dir="rtl"
        >
          {arabicMatched ? (
            <Highlighted
              text={snippetAround(result.arabic_uthmani, query, 60)}
              query={query}
            />
          ) : result.arabic_uthmani.length > 180 ? (
            `${result.arabic_uthmani.slice(0, 180)}…`
            ) : (
            result.arabic_uthmani
          )}
        </p>

        {result.matches.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {result.matches.map((m, i) => (
              <div key={i}>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px",
                    fontStyle: "italic",
                    color: "#2a1f08",
                    lineHeight: 1.6,
                    direction:
                      m.language_code === "fa" || m.language_code === "ur"
                        ? "rtl"
                        : "ltr",
                    textAlign:
                      m.language_code === "fa" || m.language_code === "ur"
                        ? "right"
                        : "left",
                  }}
                  lang={m.language_code}
                >
                  &ldquo;
                  <Highlighted text={snippetAround(m.text, query)} query={query} />
                  &rdquo;
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "9px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#7a6030",
                    marginTop: "3px",
                  }}
                >
                  {m.scholar_name} · {m.language_code}
                </p>
              </div>
            ))}
          </div>
        ) : result.translation_text ? (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "16px",
              fontStyle: "italic",
              color: "#2a1f08",
              lineHeight: 1.6,
            }}
          >
            &ldquo;{snippetAround(result.translation_text, query)}&rdquo;
            {result.translation_scholar ? (
              <span
                style={{
                  display: "block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "9px",
                  fontStyle: "normal",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#7a6030",
                  marginTop: "3px",
                }}
              >
                {result.translation_scholar}
                {result.translation_language_code
                  ? ` · ${result.translation_language_code}`
                  : ""}
              </span>
            ) : null}
          </p>
        ) : null}
      </article>
    </Link>
  );
}

interface SearchClientProps {
  initialQuery: string;
  initialPage: number;
  initialData: SearchResponse | null;
  initialError: string | null;
}

export default function SearchClient({
  initialQuery,
  initialPage,
  initialData,
  initialError,
}: SearchClientProps) {
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<SearchResponse | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const abortRef = useRef<AbortController | null>(null);
  // The server already fetched page `initialPage` for `initialQuery`.
  const skipFirstFetchRef = useRef(initialData !== null || initialError !== null);

  const runSearch = useCallback(async (q: string, p: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&page=${p}`,
        { signal: controller.signal }
      );
      const json = (await res.json()) as SearchResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Search failed. Please try again.");
      }
      setData(json);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setData(null);
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // Debounce typed input: a new term resets to page 1.
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === query) return;
    const t = setTimeout(() => {
      setQuery(trimmed);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [input, query]);

  // Fetch when the committed query/page changes (except the server-rendered first paint).
  useEffect(() => {
    if (skipFirstFetchRef.current) {
      skipFirstFetchRef.current = false;
      return;
    }
    if (query.length < MIN_QUERY_LENGTH) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    runSearch(query, page);
    const url =
      page > 1
        ? `/search?q=${encodeURIComponent(query)}&page=${page}`
        : `/search?q=${encodeURIComponent(query)}`;
    window.history.replaceState(null, "", url);
  }, [query, page, runSearch]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed === query && page === 1 && trimmed.length >= MIN_QUERY_LENGTH) {
      runSearch(trimmed, 1);
      return;
    }
    setQuery(trimmed);
    setPage(1);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        role="search"
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search the Quran — a word, a phrase, or Arabic…"
          aria-label="Search the Quran"
          dir="auto"
          autoFocus={!initialQuery}
          style={{
            flex: 1,
            fontFamily: "'Inter', sans-serif",
            fontSize: "15px",
            padding: "12px 14px",
            border: "0.5px solid rgba(201,162,39,0.45)",
            borderRadius: "4px",
            background: "#fffdf6",
            color: "#0d0a04",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "#c9a227",
            color: "#fffdf6",
            border: "none",
            borderRadius: "4px",
            padding: "0 20px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          color: "#7a6030",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}
      >
        Searches the Arabic text and every translation (English, Persian and
        Urdu). Arabic is matched exactly as written in the Uthmani script,
        including its diacritics.
      </p>

      {loading && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "#7a6030",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
          role="status"
        >
          Searching…
        </p>
      )}

      {!loading && error && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#8b2e2e",
            lineHeight: 1.6,
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && query.length >= MIN_QUERY_LENGTH && data && (
        <>
          {data.total_results === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "20px",
                  color: "#2a1f08",
                  marginBottom: "8px",
                }}
              >
                No results for &ldquo;{query}&rdquo;
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#7a6030",
                  lineHeight: 1.7,
                }}
              >
                Check the spelling, try a shorter phrase, or search the
                Arabic text exactly as it appears in the Uthmani script.
              </p>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#7a6030",
                  marginBottom: "16px",
                }}
                role="status"
              >
                {data.total_results}{" "}
                {data.total_results === 1 ? "verse" : "verses"} found for
                &ldquo;{query}&rdquo;
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {data.results.map((r) => (
                  <ResultCard key={r.ayah_id} result={r} query={query} />
                ))}
              </div>

              {data.total_pages > 1 && (
                <nav
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "24px",
                    borderTop: "0.5px solid rgba(201,162,39,0.15)",
                    paddingTop: "18px",
                  }}
                  aria-label="Search result pages"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: page <= 1 ? "#b8a888" : "#c9a227",
                      background: "none",
                      border: "none",
                      cursor: page <= 1 ? "default" : "pointer",
                      padding: 0,
                    }}
                  >
                    ← Previous
                  </button>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      color: "#7a6030",
                    }}
                  >
                    Page {data.page} of {data.total_pages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.total_pages}
                    onClick={() =>
                      setPage((p) => Math.min(data.total_pages, p + 1))
                    }
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "10px",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: page >= data.total_pages ? "#b8a888" : "#c9a227",
                      background: "none",
                      border: "none",
                      cursor: page >= data.total_pages ? "default" : "pointer",
                      padding: 0,
                    }}
                  >
                    Next →
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}

      {!loading && !error && query.length < MIN_QUERY_LENGTH && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "#7a6030",
            lineHeight: 1.7,
          }}
        >
          Type at least {MIN_QUERY_LENGTH} characters — for example
          &ldquo;mercy&rdquo;, &ldquo;patience&rdquo;, or an Arabic word — and
          results will appear as you type.
        </p>
      )}
    </div>
  );
}
