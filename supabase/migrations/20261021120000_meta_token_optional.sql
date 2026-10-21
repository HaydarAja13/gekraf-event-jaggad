-- Access token Conversions API dibuat opsional: Pixel browser tetap bisa
-- dikonfigurasi tanpa token, hanya event server (CAPI) yang dilewati.
alter table public.meta_settings drop constraint meta_settings_token_not_blank;

-- Kolom tetap wajib terisi (NOT NULL), tetapi boleh string kosong.
alter table public.meta_settings alter column access_token set default '';

notify pgrst, 'reload schema';
