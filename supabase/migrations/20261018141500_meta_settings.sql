create table public.meta_settings (
  id smallint primary key default 1,
  pixel_id text not null,
  access_token text not null,
  test_event_code text not null default '',
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint meta_settings_singleton check (id = 1),
  constraint meta_settings_pixel_shape check (pixel_id ~ '^[0-9]{5,20}$'),
  constraint meta_settings_token_not_blank check (length(btrim(access_token)) > 0),
  constraint meta_settings_test_code_shape check (test_event_code ~ '^[A-Za-z0-9]{0,32}$')
);

alter table public.meta_settings enable row level security;

revoke all on public.meta_settings from anon, authenticated;
grant select, insert, update, delete on public.meta_settings to service_role;

notify pgrst, 'reload schema';
