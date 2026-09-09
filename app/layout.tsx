import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TathirQuran — Daily Ayah",
  description: "Purify your mornings with the Word of Allah. Daily Quran verse with Shia translations and tafsir.",
  keywords: ["Quran", "Shia", "daily ayah", "Islamic", "Quran app", "تطهیر"],
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    title: "TathirQuran — Daily Ayah",
    description: "Purify your mornings with the Word of Allah.",
    url: "https://tathirquran.com",
    siteName: "TathirQuran",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TathirQuran — Daily Ayah",
    description: "Purify your mornings with the Word of Allah.",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1005" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
