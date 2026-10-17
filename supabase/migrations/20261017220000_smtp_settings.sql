create table public.smtp_settings (
  id smallint primary key default 1,
  host text not null,
  port integer not null,
  secure boolean not null,
  username text not null,
  password text not null,
  from_name text not null,
  from_email text not null,
  updated_at timestamptz not null default now(),
  constraint smtp_settings_singleton check (id = 1),
  constraint smtp_settings_host_shape check (host ~ '^[A-Za-z0-9.-]+$'),
  constraint smtp_settings_port_range check (port between 1 and 65535),
  constraint smtp_settings_username_not_blank check (length(btrim(username)) > 0),
  constraint smtp_settings_password_not_blank check (length(password) > 0),
  constraint smtp_settings_from_name_not_blank check (length(btrim(from_name)) > 0),
  constraint smtp_settings_from_email_shape check (from_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$')
);

alter table public.smtp_settings enable row level security;

revoke all on public.smtp_settings from anon, authenticated;
grant select, insert, update, delete on public.smtp_settings to service_role;

notify pgrst, 'reload schema';
