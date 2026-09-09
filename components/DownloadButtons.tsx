"use client";

export default function DownloadButtons() {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* App Store */}
      <a
        href="#"
        aria-label="Download on the App Store — coming soon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          border: "1px solid rgba(201,162,39,0.5)",
          borderRadius: "2px",
          color: "#c9a227",
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textDecoration: "none",
          textTransform: "uppercase",
          fontWeight: 500,
          transition: "all 0.15s ease",
          opacity: 0.7,
          cursor: "not-allowed",
        }}
        tabIndex={-1}
        onClick={(e) => e.preventDefault()}
      >
        <AppleIcon />
        iOS — Coming Soon
      </a>

      {/* Play Store */}
      <a
        href="#"
        aria-label="Download on Google Play — coming soon"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          border: "1px solid rgba(201,162,39,0.5)",
          borderRadius: "2px",
          color: "#c9a227",
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textDecoration: "none",
          textTransform: "uppercase",
          fontWeight: 500,
          transition: "all 0.15s ease",
          opacity: 0.7,
          cursor: "not-allowed",
        }}
        tabIndex={-1}
        onClick={(e) => e.preventDefault()}
      >
        <AndroidIcon />
        Android — Coming Soon
      </a>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.69 0-1.35.12-1.96.33L8.56.35c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C7.34 3.06 6 5.07 6 7.35h12c0-2.28-1.34-4.29-3.47-5.19zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
    </svg>
  );
}
