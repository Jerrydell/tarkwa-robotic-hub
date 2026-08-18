-- =============================================================
-- Phase 6: app-wide settings (site-wide toggles managed by Super Admin)
-- =============================================================

create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

alter table app_settings enable row level security;

-- Settings are read by the app (e.g. "is chat enabled") so any
-- authenticated user can read them; only Super Admin can write.
create policy "app_settings_select_authenticated" on app_settings
  for select using (auth.role() = 'authenticated');

create policy "app_settings_write_super_admin" on app_settings
  for all using (is_super_admin());

insert into app_settings (key, value) values
  ('chat_enabled', 'true'::jsonb),
  ('maintenance_mode', 'false'::jsonb)
on conflict (key) do nothing;
