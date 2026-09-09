create table tafsir (
  id            bigserial primary key,
  ayah_id       bigint references ayahs(ayah_id),
  scholar       text not null,
  language_code text references languages(language_code),
  text          text not null,
  source_book   text,
  volume        text,
  created_at    timestamptz default now()
);

create index idx_tafsir_ayah on tafsir(ayah_id);
