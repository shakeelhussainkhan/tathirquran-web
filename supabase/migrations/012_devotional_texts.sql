-- 012_devotional_texts.sql
-- Occasion duas & ziyarat (Wave C — devotionals).
--
-- One row per devotional text (dua / ziyarat). Content rule (Shakeel,
-- standing): every text stored here must be a VERBATIM text from a Shia
-- (Ithna Ashari) source, with the source recorded in source_note. No Sunni
-- tafsir/sourced content, no AI-written text, no invented translations.
-- Rows are added only via scripts/load_devotional_texts.js from
-- scripts/devotional_texts.json after Shakeel verifies the texts.
--
-- occasion_tag matches the `occasion` string in islamic_calendar_tags
-- (e.g. 'Ashura — Day of Imam Husayn (AS)') so the home / Today surfaces can
-- pair the day's occasion with its devotional. NULL = not occasion-bound
-- (e.g. Dua Kumayl is surfaced by the Thursday-evening rule via its slug).

create table devotional_texts (
  id               serial primary key,
  slug             text unique not null,
  title            text not null,
  occasion_tag     text,
  arabic_text      text not null,
  translation_text text,
  source_note      text not null
);

-- RLS: same public-read pattern as the other content tables (010_rls.sql).
alter table devotional_texts enable row level security;

create policy "Public read devotional_texts"
  on devotional_texts for select using (true);
