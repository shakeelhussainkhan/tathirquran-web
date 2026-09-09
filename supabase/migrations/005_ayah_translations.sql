create table ayah_translations (
  id              bigserial primary key,
  ayah_id         bigint references ayahs(ayah_id),
  translation_id  int references translations(translation_id),
  text            text not null,
  verified_at     timestamptz,
  unique(ayah_id, translation_id)
);

create index idx_ayah_translations_ayah        on ayah_translations(ayah_id);
create index idx_ayah_translations_translation on ayah_translations(translation_id);
