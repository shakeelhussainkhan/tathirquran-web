-- 014_circles.sql — Family circles (Wave C, privacy-first, minimal)
--
-- A "circle" is a small, trusted group (a family, a few friends) whose
-- members each see whether the others have read today's daily verse.
-- There are NO accounts and NO emails: a member is identified only by a
-- random device-held UUID (see the app's lib/device.ts) plus a display
-- name the member chooses, and the only access control is knowing the
-- circle's invite code. Anyone who has the code can join and see the
-- display names and read status of the circle — so circles are for
-- trusted family / small groups only, and the code should be shared
-- the way you would share a house key. This is stated plainly in the
-- app UI and in the PR that adds this migration; do not describe this
-- feature as private or secure beyond that model.
--
-- Access pattern: RLS is enabled on all three tables with NO policies
-- at all, so the anon and authenticated roles can read and write
-- nothing directly. Every read/write goes through the service-role API
-- routes in app/api/circles/*, which check membership (device_id must
-- be a member of the circle) before returning anything.
--
-- Shakeel runs this migration himself in the Supabase SQL editor.
-- It has NOT been run against production as part of building the
-- feature, and the API routes return an honest 503 "Circles aren't
-- available yet" until it has been run.

create table if not exists circles (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table if not exists circle_members (
  id          serial primary key,
  circle_id   uuid not null references circles(id) on delete cascade,
  device_id   text not null,
  display_name text not null,
  joined_at   timestamptz default now(),
  unique (circle_id, device_id)
);

create table if not exists circle_checkins (
  id            serial primary key,
  circle_id     uuid not null references circles(id) on delete cascade,
  device_id     text not null,
  schedule_date date not null,
  created_at    timestamptz default now(),
  unique (circle_id, device_id, schedule_date)
);

create index if not exists circle_members_circle_idx
  on circle_members (circle_id);
create index if not exists circle_checkins_circle_date_idx
  on circle_checkins (circle_id, schedule_date);

-- RLS on, and deliberately NO policies: anon/authenticated get nothing.
alter table circles        enable row level security;
alter table circle_members enable row level security;
alter table circle_checkins enable row level security;

-- Belt and braces: make sure the public roles hold no table privileges
-- either (RLS alone would still deny them, this removes any doubt).
revoke all on table circles, circle_members, circle_checkins
  from anon, authenticated, public;

-- The API routes use the service-role key, which bypasses RLS — but the
-- service role still needs table privileges (this project learned that
-- the hard way: see HANDOVER §3, the service_role GRANTs were missing
-- at first and had to be added by hand).
grant select, insert, update, delete
  on table circles, circle_members, circle_checkins
  to service_role;
grant usage, select
  on sequence circle_members_id_seq, circle_checkins_id_seq
  to service_role;

-- Verify after running: this should return ZERO rows (no public
-- policies on the circles tables).
-- select policyname, tablename, roles from pg_policies
-- where schemaname = 'public'
--   and tablename in ('circles', 'circle_members', 'circle_checkins');
