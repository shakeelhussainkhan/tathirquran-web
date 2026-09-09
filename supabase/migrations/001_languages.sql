create table languages (
  language_code     text primary key,
  language_name     text not null,
  native_name       text not null,
  script            text not null,
  rtl               boolean default false,
  font_family       text,
  launch_status     text default 'pending' check (launch_status in ('live','beta','pending')),
  display_order     int,
  created_at        timestamptz default now()
);

insert into languages (language_code, language_name, native_name, script, rtl, font_family, launch_status, display_order) values
  ('ar', 'Arabic',    'العربية',         'Arabic',             true,  'Scheherazade New',      'live',    1),
  ('en', 'English',   'English',          'Latin',              false, 'Inter',                 'live',    2),
  ('fa', 'Persian',   'فارسی',            'Perso-Arabic',       true,  'Vazirmatn',             'live',    3),
  ('ur', 'Urdu',      'اردو',             'Nastaliq',           true,  'Noto Nastaliq Urdu',    'beta',    4),
  ('hi', 'Hindi',     'हिंदी',            'Devanagari',         false, 'Noto Sans Devanagari',  'pending', 5),
  ('tr', 'Turkish',   'Türkçe',           'Latin',              false, 'Inter',                 'pending', 6),
  ('fr', 'French',    'Français',         'Latin',              false, 'Inter',                 'pending', 7),
  ('es', 'Spanish',   'Español',          'Latin',              false, 'Inter',                 'pending', 8),
  ('nl', 'Dutch',     'Nederlands',       'Latin',              false, 'Inter',                 'pending', 9),
  ('id', 'Indonesian','Bahasa Indonesia', 'Latin',              false, 'Inter',                 'pending', 10),
  ('ms', 'Malay',     'Bahasa Melayu',    'Latin',              false, 'Inter',                 'pending', 11),
  ('bn', 'Bengali',   'বাংলা',            'Bengali',            false, 'Noto Sans Bengali',     'pending', 12),
  ('sw', 'Swahili',   'Kiswahili',        'Latin',              false, 'Inter',                 'pending', 13),
  ('ha', 'Hausa',     'Hausa',            'Latin',              false, 'Inter',                 'pending', 14),
  ('de', 'German',    'Deutsch',          'Latin',              false, 'Inter',                 'pending', 15),
  ('ru', 'Russian',   'Русский',          'Cyrillic',           false, 'Inter',                 'pending', 16),
  ('bs', 'Bosnian',   'Bosanski',         'Latin',              false, 'Inter',                 'pending', 17);
