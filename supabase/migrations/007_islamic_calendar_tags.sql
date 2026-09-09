create table islamic_calendar_tags (
  id           serial primary key,
  ayah_id      bigint references ayahs(ayah_id),
  occasion     text not null,
  hijri_month  int check (hijri_month between 1 and 12),
  hijri_day    int check (hijri_day between 1 and 30),
  priority     int default 5,
  notes        text
);

-- Placeholder seed — ayah_id=1 (Al-Fatiha 1:1) used as placeholder.
-- Update with curated ayah selections for each occasion as content grows.
insert into islamic_calendar_tags (ayah_id, occasion, hijri_month, hijri_day, priority, notes) values
  (1, 'Ashura — Day of Imam Husayn (AS)',   1,  10, 10, 'Muharram 10'),
  (1, 'Arbaeen',                            2,  20,  9, 'Safar 20'),
  (1, 'Wiladat Imam Ali (AS)',             13,  13, 10, 'Rajab 13'),
  (1, 'Laylat al-Qadr',                    9,  23, 10, 'Ramadan 23'),
  (1, 'Eid al-Fitr',                       10,  1,  9, 'Shawwal 1'),
  (1, 'Eid al-Adha',                       12, 10,  9, 'Dhul Hijjah 10'),
  (1, 'Eid al-Ghadeer',                    12, 18, 10, 'Dhul Hijjah 18 — most important Shia occasion'),
  (1, 'Mabath — First Revelation',          7, 27,  9, 'Rajab 27'),
  (1, 'Wiladat Imam Mahdi (AS)',            8, 15, 10, 'Shaban 15'),
  (1, 'Wiladat Prophet Muhammad (SAWW)',    3, 17,  9, 'Rabi al-Awwal 17');
