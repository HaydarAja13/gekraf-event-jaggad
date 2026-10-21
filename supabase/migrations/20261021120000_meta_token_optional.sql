-- Access token Conversions API dibuat opsional: Pixel browser tetap bisa
-- dikonfigurasi tanpa token, hanya event server (CAPI) yang dilewati.
--
-- Idempotent: constraint dicek dulu sebelum di-drop, jadi file ini boleh
-- dijalankan berulang di SQL Editor tanpa error 42704 bila sudah pernah jalan.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'meta_settings_token_not_blank'
      and conrelid = 'public.meta_settings'::regclass
  ) then
    alter table public.meta_settings drop constraint meta_settings_token_not_blank;
  end if;
end $$;

-- Kolom tetap wajib terisi (NOT NULL), tetapi boleh string kosong.
alter table public.meta_settings alter column access_token set default '';

notify pgrst, 'reload schema';
