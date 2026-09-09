import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TathirQuran — Daily Ayah",
  description: "Purify your mornings with the Word of Allah. The first Shia-specific daily Quran app with verified Shia translations.",
  keywords: ["Quran", "Shia", "daily ayah", "Islamic", "Quran app", "تطهیر"],
  openGraph: {
    title: "TathirQuran — Daily Ayah",
    description: "Purify your mornings with the Word of Allah.",
    siteName: "TathirQuran",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: "#fdfaf4" }}>
        {children}
      </body>
    </html>
  );
}
