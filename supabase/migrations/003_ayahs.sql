create table ayahs (
  ayah_id           bigserial primary key,
  surah_number      int references surahs(surah_number),
  ayah_number       int not null,
  arabic_uthmani    text not null,
  transliteration   text,
  juz_number        int,
  page_number       int,
  hizb_number       int,
  unique(surah_number, ayah_number)
);

create index idx_ayahs_surah on ayahs(surah_number);
create index idx_ayahs_juz   on ayahs(juz_number);
