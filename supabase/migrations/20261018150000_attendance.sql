-- Kehadiran peserta: satu baris peserta (orders) punya satu status check-in.
-- Kolom nullable = "belum hadir"; checked_in_by mencatat admin pelaku (scan QR
-- atau manual) supaya ada jejak audit saat ada koreksi di lapangan.
alter table public.orders
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by text;

-- Halaman absensi mengurutkan dan memfilter peserta ACC per kategori tiket.
create index if not exists orders_approved_plan_idx
  on public.orders (plan_name)
  where status = 'approved';

-- Scan QR mencari peserta lewat nomor tiket; indeks unik ticket_no sudah ada.
