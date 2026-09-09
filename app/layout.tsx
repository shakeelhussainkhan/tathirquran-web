import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'TathirQuran — Daily Shia Quran Verse',
  description: 'Start every morning with a verse from the Holy Quran. Shia-verified translations by M.H. Shakir, Muhammad Sarwar, and Mahdi Ilahi Ghomshei. Free app by Five S LLC.',
  keywords: ["Quran", "Shia", "daily ayah", "Islamic", "Quran app", "تطهیر"],
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
    shortcut: '/icon',
  },
  openGraph: {
    title: 'TathirQuran — Daily Shia Quran Verse',
    description: 'Purify your mornings with the Word of Allah. Shia-verified translations in English, Persian and more.',
    url: 'https://tathirquran.com',
    siteName: 'TathirQuran',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TathirQuran — Daily Shia Quran Verse',
    description: 'Purify your mornings with the Word of Allah.',
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
