create table translations (
  translation_id    serial primary key,
  language_code     text references languages(language_code),
  scholar_name      text not null,
  scholar_title     text,
  institution       text,
  school            text default 'Shia Ithna Ashari',
  is_verified_shia  boolean default false,
  is_default        boolean default false,
  is_placeholder    boolean default false,
  placeholder_note  text,
  license_type      text check (license_type in ('public_domain','licensed','partnership','open')),
  attribution_text  text,
  completeness_pct  int default 0 check (completeness_pct between 0 and 100),
  created_at        timestamptz default now()
);

-- Core verified Shia translations (free / public domain)
insert into translations
  (language_code, scholar_name, scholar_title, institution, is_verified_shia, is_default, license_type, attribution_text, completeness_pct)
values
  ('en', 'M.H. Shakir',          null, 'Tahrike Tarsile Quran', true,  true,  'public_domain', 'Translation by M.H. Shakir',           100),
  ('en', 'Muhammad Sarwar',      null, 'Independent',           true,  false, 'open',          'Translation by Muhammad Sarwar',       100),
  ('fa', 'Mahdi Ilahi Ghomshei', null, 'Iranian Scholars',      true,  true,  'public_domain', 'ترجمه مهدی الهی قمشه‌ای',              100),
  ('ar', 'Original Arabic',      null, 'Tanzil.net',            true,  true,  'open',          'Uthmani script — Hafs narration',      100);

-- Urdu Shia scholars (permission pending — no text loaded yet)
insert into translations
  (language_code, scholar_name, scholar_title, institution, is_verified_shia, is_default, license_type, attribution_text, completeness_pct)
values
  ('ur', 'Muhammad Hussain Najafi', 'Allama',  'Jamia Imamia Pakistan', true, true,  'licensed',
   'ترجمہ: علامہ محمد حسین نجفی — اجازت زیر التوا', 0),
  ('ur', 'Syed Zeeshan Haider Jawadi', 'Syed', 'Imamia Mission Pakistan', true, false, 'licensed',
   'ترجمہ: سید ذیشان حیدر جوادی — اجازت زیر التوا', 0),
  ('ur', 'Maulana Farman Ali', 'Maulana', 'Shia Scholars — Estate', true, false, 'licensed',
   'ترجمہ: مولانا فرمان علی — اجازت زیر التوا', 0);
