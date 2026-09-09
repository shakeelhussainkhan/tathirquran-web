create table permission_requests (
  id              serial primary key,
  scholar_name    text not null,
  institution     text,
  language_code   text references languages(language_code),
  translation_id  int references translations(translation_id),
  sent_date       date,
  status          text default 'sent' check (status in ('draft','sent','responded','approved','declined')),
  notes           text,
  contact_email   text,
  created_at      timestamptz default now()
);

-- Initial outreach — Sep 8 2026
insert into permission_requests (scholar_name, institution, language_code, sent_date, status, notes) values
  ('Muhammad Hussain Najafi', 'Jamia Imamia / World Islamic Forum', 'ur', '2026-09-08', 'sent',
   'Letter sent via Five S LLC / Shakeel Hussain Khan'),
  ('Syed Zeeshan Haider Jawadi', 'Imamia Mission Lahore', 'ur', '2026-09-08', 'sent',
   'Letter sent via Five S LLC / Shakeel Hussain Khan'),
  ('Farman Ali Estate', 'Shia Ulama Council / Imamia Kutub Khana', 'ur', '2026-09-08', 'sent',
   'Letter sent to estate/publisher');
