-- Enable RLS on all tables (anonymous read-only for app users)
alter table languages          enable row level security;
alter table surahs             enable row level security;
alter table ayahs              enable row level security;
alter table translations       enable row level security;
alter table ayah_translations  enable row level security;
alter table tafsir             enable row level security;
alter table islamic_calendar_tags enable row level security;
alter table daily_schedule     enable row level security;
alter table permission_requests enable row level security;

-- Public read policies
create policy "Public read languages"             on languages             for select using (true);
create policy "Public read surahs"                on surahs                for select using (true);
create policy "Public read ayahs"                 on ayahs                 for select using (true);
create policy "Public read translations"          on translations          for select using (true);
create policy "Public read ayah_translations"     on ayah_translations     for select using (true);
create policy "Public read tafsir"                on tafsir                for select using (true);
create policy "Public read islamic_calendar_tags" on islamic_calendar_tags for select using (true);
create policy "Public read daily_schedule"        on daily_schedule        for select using (true);
create policy "Public read permission_requests"   on permission_requests   for select using (true);
