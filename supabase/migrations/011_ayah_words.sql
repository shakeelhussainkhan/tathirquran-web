-- 011_ayah_words.sql
--
-- Word-by-word LEXICAL glosses for every ayah, loaded by
-- scripts/load_ayah_words.js from the Quran.com API v4 word data.
--
-- CONTENT FRAMING (important): translation_en in this table is a lexical
-- (dictionary) gloss of ONE Arabic word at a time — e.g. for 1:1 the words
-- gloss as "In (the) name / (of) Allah / the Most Gracious / the Most
-- Merciful". It is NOT a translation of the verse, NOT tafsir and NOT
-- commentary, and it must never be presented as any of those. The verse
-- translations shown by the app/website remain the existing Shia
-- translations in ayah_translations; this table only powers the optional
-- "Word by word" learning view.
--
-- Run this migration BEFORE running scripts/load_ayah_words.js.
-- (Per project convention Shakeel runs SQL himself in the Supabase SQL
-- editor; nothing in the app or website writes to this table.)

create table ayah_words (
  id              bigserial primary key,
  ayah_id         bigint not null references ayahs(ayah_id) on delete cascade,
  position        int not null,
  arabic_text     text not null,
  translation_en  text,
  transliteration text,
  unique (ayah_id, position)
);

create index idx_ayah_words_ayah on ayah_words(ayah_id);

-- RLS: same public-read pattern as the other content tables (see 010_rls.sql).
alter table ayah_words enable row level security;

create policy "Public read ayah_words" on ayah_words for select using (true);

-- Table privileges (the project has hit missing-GRANT issues before — see
-- HANDOVER §3: service_role table rights had to be granted explicitly).
grant select on ayah_words to anon, authenticated;
grant all on ayah_words to service_role;
grant usage, select on sequence ayah_words_id_seq to service_role;
