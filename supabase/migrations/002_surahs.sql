create table surahs (
  surah_number        int primary key check (surah_number between 1 and 114),
  name_arabic         text not null,
  name_transliterated text not null,
  name_english        text not null,
  revelation_type     text check (revelation_type in ('Meccan','Medinan')),
  ayah_count          int not null,
  juz_start           int
);
