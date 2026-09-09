create table daily_schedule (
  schedule_date date primary key,
  ayah_id       bigint references ayahs(ayah_id),
  reason        text default 'sequential' check (reason in ('sequential','islamic_calendar','curated','special')),
  notes         text,
  created_at    timestamptz default now()
);

create index idx_daily_schedule_date on daily_schedule(schedule_date);
