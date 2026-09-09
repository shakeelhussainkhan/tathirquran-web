# TathirQuran — تطهیر القرآن

> Purify your mornings with the Word of Allah

The first Shia-specific daily Quran lock screen app. Delivers one verified Shia ayah per day to your phone's lock screen.

---

## Architecture

| Surface | Stack |
|---------|-------|
| Website | Next.js 16 (App Router), TypeScript, Tailwind v4 |
| Backend | Supabase (PostgreSQL + RLS) |
| Mobile | React Native (Phase 2) |
| iOS Widget | SwiftUI + WidgetKit (Phase 3) |
| Android Widget | Kotlin + Glance (Phase 3) |
| Deployment | Netlify (auto-deploy from GitHub) |

---

## Quick Start

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a **new project** (do **not** reuse any existing project). Choose a strong database password and save it.

### 2. Run Migrations

In the Supabase SQL editor, run each migration file in order:

```
supabase/migrations/001_languages.sql
supabase/migrations/002_surahs.sql
supabase/migrations/003_ayahs.sql
supabase/migrations/004_translations.sql
supabase/migrations/005_ayah_translations.sql
supabase/migrations/006_tafsir.sql
supabase/migrations/007_islamic_calendar_tags.sql
supabase/migrations/008_daily_schedule.sql
supabase/migrations/009_permission_requests.sql
supabase/migrations/010_rls.sql
```

### 3. Configure Environment Variables

Copy `.env.local` (already created) and fill in the values from your Supabase project's **Settings → API** page:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://tathirquran.com
```

### 4. Run the Seed Script

```bash
node scripts/seed.js
```

This fetches from the Quran.com open API and inserts:
- 114 surahs with metadata
- 6236 Arabic ayahs (Uthmani script, Hafs narration)
- M.H. Shakir English translation (6236 ayahs)
- Muhammad Sarwar English translation (6236 ayahs)
- Any available Urdu translations from Quran.com (as placeholders)
- 2-year daily schedule (Sep 2026 → Sep 2028)

The seed script logs counts on completion.

### 5. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
tathirquran-web/
├── app/
│   ├── layout.tsx              — Root layout, fonts, metadata
│   ├── page.tsx                — Home / Today page
│   ├── HomeInteractive.tsx     — Client-side language switcher
│   ├── today/page.tsx          — /today → redirects to /
│   ├── ayah/[surah]/[ayah]/    — Specific ayah page
│   ├── archive/page.tsx        — Past daily ayahs
│   ├── about/page.tsx          — Mission, scholars, contact
│   ├── admin/permissions/      — Permission requests tracker (localhost only)
│   └── api/
│       ├── today/              — GET /api/today
│       ├── ayah/[id]/          — GET /api/ayah/2-255
│       ├── ayah-translation/   — GET /api/ayah-translation?ayah_id=1-1&language=fa
│       └── languages/[code]/translations/
├── components/
│   ├── AyahCard.tsx            — Main verse display (Design Option J)
│   ├── BronzeBar.tsx           — 3px vertical bronze gradient bar
│   ├── TafsirPanel.tsx         — Collapsible tafsir section
│   ├── LanguageSelector.tsx    — Language pill buttons
│   ├── TranslationSelector.tsx — Scholar dropdown (multiple per language)
│   ├── DownloadButtons.tsx     — App Store / Play Store CTAs
│   └── LockScreenPreview.tsx   — Phone lock screen widget mockup
├── lib/
│   ├── supabase.ts             — Supabase client
│   ├── queries.ts              — All DB query functions
│   └── utils.ts                — Hijri calendar, date helpers
├── types/index.ts              — TypeScript interfaces for all DB tables
├── supabase/migrations/        — SQL migration files (run in Supabase SQL editor)
├── scripts/seed.js             — Database seeder (run with node)
├── netlify.toml                — Netlify deployment config
└── .env.local                  — Environment variables (fill in after Supabase setup)
```

---

## API Reference

### `GET /api/today`

Returns today's scheduled ayah with translation and tafsir.

```json
{
  "date": "2026-09-08",
  "hijri_date": "14 Safar 1448 AH",
  "ayah": {
    "surah_number": 1,
    "ayah_number": 1,
    "arabic_uthmani": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "transliteration": null
  },
  "surah": {
    "name_arabic": "الفاتحة",
    "name_english": "Al-Fatihah",
    "name_transliterated": "Al-Fatihah"
  },
  "translation": {
    "text": "In the name of Allah, the Beneficent, the Merciful.",
    "scholar_name": "M.H. Shakir",
    "language_code": "en"
  },
  "tafsir": null
}
```

Cache: `public, max-age=3600` — safe for mobile app consumption.

### `GET /api/ayah/[id]`

Full ayah data. `id` format: `{surah}-{ayah}` e.g. `/api/ayah/2-255`

Returns all available translations and tafsir for that ayah.

---

## Design System — Option J (Ivory + Bronze Bar)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-ivory` | `#fdfaf4` | Primary background |
| `--color-ivory-deep` | `#f5f0e8` | Cards, secondary surfaces |
| `--color-bronze` | `#c9a227` | Primary accent, links |
| `--color-bronze-light` | `#e8c96a` | Gradient top |
| `--color-bronze-dark` | `#8b6520` | Gradient bottom, text accents |
| `--color-ink` | `#0d0a04` | Primary text, Arabic |
| `--color-ink-mid` | `#2a1f08` | Body text |
| `--color-ink-soft` | `#7a6030` | Secondary text, dates |

Fonts:
- Arabic text → **Amiri** (serif, RTL, 1.8 line-height)
- Translation → **Cormorant Garamond** (serif italic, 1.65 line-height)
- UI / labels → **Inter** (sans-serif)
- Urdu → **Noto Nastaliq Urdu** (serif, RTL, 2.2 line-height)

Signature: 3px vertical bronze gradient bar on the left edge of every ayah card.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `languages` | Supported languages with launch status |
| `surahs` | 114 surahs with metadata |
| `ayahs` | 6236 Arabic ayah texts (Uthmani) |
| `translations` | Scholar translation metadata |
| `ayah_translations` | Translated text per ayah per translation |
| `tafsir` | Commentary entries (scholar, book, volume) |
| `islamic_calendar_tags` | Hijri occasions mapped to relevant ayahs |
| `daily_schedule` | One ayah per calendar date |
| `permission_requests` | Outreach tracking for translation licensing |

All tables have RLS enabled with anonymous read access.

---

## Translation Status

| Language | Scholar | Status |
|----------|---------|--------|
| English | M.H. Shakir | ✅ Live (6236 ayahs, public domain) |
| English | Muhammad Sarwar | ✅ Live (6236 ayahs, open) |
| Persian | Mahdi Ilahi Ghomshei | ✅ Live (6236 ayahs, public domain) |
| Urdu | Allama Muhammad Hussain Najafi | ⏳ Pending — permission letter sent Sep 2026 |
| Urdu | Syed Zeeshan Haider Jawadi | ⏳ Pending — permission letter sent Sep 2026 |
| Urdu | Maulana Farman Ali | ⏳ Pending — letter to estate/publisher Sep 2026 |

Track status: [http://localhost:3000/admin/permissions](http://localhost:3000/admin/permissions) (localhost only)

---

## Deployment — Netlify

1. Push this repo to GitHub as `tathirquran-web`
2. Connect the repo in Netlify → New Site
3. Add environment variables in Netlify → Site Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://tathirquran.com`
4. Point the `tathirquran.com` Namecheap domain to Netlify DNS

Build settings are in `netlify.toml` — no additional config needed.

---

## Next Steps — Phase 2

- [ ] Add Persian (Ghomshei) ayah text via Quran.com API (translation id for Persian)
- [ ] Add tafsir entries (Al-Mizan by Tabataba'i, Tafsir Nemooneh by Makarem Shirazi)
- [ ] Add transliteration data
- [ ] Build React Native app shell
- [ ] Implement Urdu translations once permissions granted
- [ ] Add OG image generation per ayah
- [ ] Add email/push notification for daily ayah
- [ ] Add Arabic original to language selector

---

## Project Notes

This is a **sadaqah jariyah** project — non-commercial, built for the Shia community. Keep the codebase clean and maintainable. The schema is designed to be language-agnostic: adding a new translation is a row insert only, no code changes needed.

Contact: tathirquran@gmail.com
