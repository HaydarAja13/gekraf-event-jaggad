"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions";
import { PendingButton } from "@/app/submit";
import { SECTIONS } from "@/lib/types";
import { Avatar, Icon, btnClass, type IconName } from "./ui";
import { Menu, MenuItem, SearchBox } from "./menu";

const GENERAL: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Ringkasan", icon: "grid" },
  { href: "/dashboard/transaksi", label: "Transaksi", icon: "receipt" },
  { href: "/dashboard/absensi", label: "Absensi", icon: "checkCircle" },
  { href: "/dashboard/customer", label: "Customer", icon: "users" },
  { href: "/dashboard/tiket", label: "Pengaturan Tiket", icon: "ticket" },
  { href: "/dashboard/pembayaran", label: "Rekening", icon: "card" },
  { href: "/dashboard/referral", label: "Referral", icon: "tag" },
  { href: "/dashboard/pengiriman", label: "Pengiriman", icon: "mail" },
  { href: "/dashboard/meta", label: "Meta Ads", icon: "megaphone" },
];

const SECTION_ICONS: Record<string, IconName> = {
  seo: "search",
  navbar: "bars",
  hero: "image",
  pain: "alert",
  audience: "users",
  speakers: "mic",
  curriculum: "list",
  why: "star",
  testimonials: "quote",
  pricing: "ticket",
  faq: "help",
  cta: "megaphone",
};

const QUICK_ACTIONS = [
  { label: "Transaksi", href: "/dashboard/transaksi", icon: "receipt" as IconName, hint: "ACC atau tolak pembayaran tiket" },
  { label: "Absensi peserta", href: "/dashboard/absensi", icon: "checkCircle" as IconName, hint: "Scan QR tiket dan rekap kehadiran" },
  { label: "Customer", href: "/dashboard/customer", icon: "users" as IconName, hint: "Daftar peserta dan riwayat tiket" },
  { label: "Pengaturan Tiket", href: "/dashboard/tiket", icon: "ticket" as IconName, hint: "Kustomisasi email & pamflet tiket" },
  { label: "Rekening tujuan", href: "/dashboard/pembayaran", icon: "card" as IconName, hint: "Kelola rekening bank pembayaran" },
  { label: "Kode referral", href: "/dashboard/referral", icon: "tag" as IconName, hint: "Kelola kupon potongan harga" },
  { label: "Pengiriman / SMTP", href: "/dashboard/pengiriman", icon: "mail" as IconName, hint: "Pengaturan dan uji email tiket" },
  { label: "Meta Ads", href: "/dashboard/meta", icon: "megaphone" as IconName, hint: "Sambungkan Pixel dan Conversions API" },
  { label: "Lihat situs", href: "/", icon: "external" as IconName, hint: "Buka halaman pendaftaran" },
];

function isActive(href: string, path: string) {
  if (href === "/dashboard") return path === "/dashboard";
  return path === href || path.startsWith(`${href}/`);
}

function NavRow({
  href,
  label,
  icon,
  active,
  badge,
  compact = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: IconName;
  active: boolean;
  badge?: number;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-[10px] px-2.5 font-medium transition-colors ${
        compact ? "h-8 text-[13px]" : "h-9 text-[13.5px]"
      } ${
        active
          ? "bg-dash-fill text-white"
          : "text-dash-muted hover:bg-dash-bg hover:text-dash-ink"
      }`}
    >
      <Icon name={icon} className={`h-[17px] w-[17px] ${active ? "text-white" : "text-dash-faint"}`} />
      <span className="min-w-0 truncate">{label}</span>
      {badge ? (
        <span
          className={`tnum ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
            active ? "bg-white/22 text-white" : "bg-dash-wait-bg text-dash-wait-fg"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function Rail({
  path,
  pending,
  onNavigate,
  brand,
  logo,
}: {
  path: string;
  pending: number;
  onNavigate?: () => void;
  brand: string;
  logo: string;
}) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <img src={logo} alt="" className="h-7 w-7 rounded-[8px] border border-dash-line object-contain" />
        <span className="min-w-0 truncate text-[15px] font-bold tracking-[-0.02em] text-dash-ink">
          {brand}
        </span>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2" aria-label="Menu dashboard">
        <ul className="flex flex-col gap-0.5">
          {GENERAL.map((item) => (
            <li key={item.href}>
              <NavRow
                {...item}
                active={isActive(item.href, path)}
                badge={item.href === "/dashboard/transaksi" ? pending : undefined}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>

        <div className="mt-3 border-t border-dash-line-soft pt-3">
          <p className="flex items-center justify-between px-2.5 pb-1.5 text-[12.5px] font-bold text-dash-ink">
            Konten situs
            <span className="text-[12px] font-medium text-dash-muted">{SECTIONS.length} bagian</span>
          </p>
          <ul className="flex flex-col gap-0.5">
            {SECTIONS.map((section) => {
              const href = `/dashboard/${section.id}`;
              return (
                <li key={section.id}>
                  <NavRow
                    href={href}
                    label={section.label}
                    icon={SECTION_ICONS[section.id] ?? "book"}
                    active={isActive(href, path)}
                    compact
                    onNavigate={onNavigate}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="shrink-0 border-t border-dash-line-soft p-2.5">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          onClick={onNavigate}
          className="flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-medium text-dash-muted transition-colors hover:bg-dash-bg hover:text-dash-ink"
        >
          <Icon name="external" className="h-[17px] w-[17px] text-dash-faint" />
          Lihat situs
        </a>
        <form action={logoutAction}>
          <PendingButton className="flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13.5px] font-medium text-dash-muted transition-colors hover:bg-dash-off-bg hover:text-dash-off-fg disabled:opacity-60">
            <Icon name="logout" className="h-[17px] w-[17px] text-dash-faint" />
            Keluar
          </PendingButton>
        </form>
      </div>
    </>
  );
}

export function Shell({
  username,
  brand,
  logo,
  pending,
  waiting,
  children,
}: {
  username: string;
  brand: string;
  logo: string;
  pending: number;
  waiting: { id: string; fullName: string; plan: string }[];
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell flex h-dvh overflow-hidden bg-dash-bg text-dash-ink">
      {open ? (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-dash-ink/45 lg:hidden"
        />
      ) : null}

      <aside
        className={`${open ? "flex" : "hidden"} fixed inset-y-2 left-2 z-40 w-[252px] flex-col rounded-[16px] border border-dash-line bg-dash-surface lg:static lg:m-2 lg:flex lg:h-[calc(100dvh-1rem)] lg:shrink-0`}
      >
        <Rail path={path} pending={pending} brand={brand} logo={logo} onNavigate={() => setOpen(false)} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-dash-line bg-dash-surface px-3 sm:gap-3 sm:px-4 xl:px-6">
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
            className={`${btnClass("outline", "md", "lg:hidden")} w-9.5 px-0`}
          >
            <Icon name="bars" className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 sm:max-w-[440px] xl:max-w-[620px]">
            <SearchBox
              action={
                path.startsWith("/dashboard/customer")
                  ? "/dashboard/customer"
                  : path.startsWith("/dashboard/absensi")
                    ? "/dashboard/absensi"
                    : "/dashboard/transaksi"
              }
              placeholder={
                path.startsWith("/dashboard/customer")
                  ? "Cari customer, email, instansi..."
                  : path.startsWith("/dashboard/absensi")
                    ? "Cari nama peserta, no. tiket, instansi..."
                    : "Cari peserta, email, atau nomor tiket"
              }
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className={btnClass("outline", "md", "hidden sm:inline-flex rounded-r-none border-r-0")}
                title="Buka situs di tab baru"
              >
                <Icon name="external" className="h-4 w-4" />
                <span>Lihat situs</span>
              </a>
              <Menu
                width={280}
                label="Aksi cepat"
                trigger={
                  <button
                    type="button"
                    aria-label="Aksi cepat"
                    className={btnClass("primary", "md", "gap-1.5 sm:rounded-l-none")}
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    <span className="hidden md:inline">Aksi cepat</span>
                    <Icon name="chevron" className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <p className="px-2.5 py-1.5 text-[11.5px] font-bold tracking-[0.08em] text-dash-muted">
                  AKSI CEPAT
                </p>
                {QUICK_ACTIONS.map((action) => (
                  <MenuItem key={action.href} href={action.href} icon={action.icon} hint={action.hint}>
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </div>

            <span className="hidden h-6 w-px bg-dash-line sm:block" />

            <Menu
              width={300}
              label="Perlu persetujuan"
              trigger={
                <button
                  type="button"
                  aria-label={`Notifikasi, ${pending} menunggu ACC`}
                  className={`${btnClass("ghost", "md", "w-9.5 px-0 relative")}`}
                >
                  <Icon name="bell" className="h-[18px] w-[18px]" />
                  {pending > 0 ? (
                    <span className="tnum absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-dash-off-fg px-1 text-[10px] font-bold text-white">
                      {pending > 9 ? "9+" : pending}
                    </span>
                  ) : null}
                </button>
              }
            >
              <p className="flex items-center justify-between px-2.5 py-1.5 text-[11.5px] font-bold tracking-[0.08em] text-dash-muted">
                PERLU ACC
                <span className="tnum">{pending}</span>
              </p>
              {waiting.length === 0 ? (
                <p className="px-2.5 pt-1 pb-3 text-[13px] text-dash-muted">
                  Tidak ada pembayaran yang menunggu. Semua transaksi sudah diproses.
                </p>
              ) : (
                waiting.map((order) => (
                  <Link
                    key={order.id}
                    href="/dashboard/transaksi?status=pending"
                    className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 transition-colors hover:bg-dash-bg"
                  >
                    <Avatar name={order.fullName} size={26} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-dash-ink">
                        {order.fullName}
                      </span>
                      <span className="block truncate text-[12px] text-dash-muted">{order.plan}</span>
                    </span>
                  </Link>
                ))
              )}
              <div className="mt-1 border-t border-dash-line-soft pt-1">
                <MenuItem href="/dashboard/transaksi?status=pending" icon="receipt">
                  Lihat pembayaran menunggu ACC
                </MenuItem>
              </div>
            </Menu>

            <Menu
              width={236}
              label="Akun"
              trigger={
                <button
                  type="button"
                  aria-label={`Akun ${username}`}
                  className={btnClass("ghost", "md", "h-10 gap-2 pr-2 pl-1")}
                >
                  <Avatar name={username} size={30} />
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-[13px] font-semibold text-dash-ink">{username}</span>
                    <span className="block text-[11.5px] text-dash-muted">Admin</span>
                  </span>
                  <Icon name="chevron" className="hidden h-4 w-4 text-dash-faint sm:block" />
                </button>
              }
            >
              <div className="flex items-center gap-2.5 px-2.5 pt-1.5 pb-2.5">
                <Avatar name={username} size={34} />
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-dash-ink">{username}</span>
                  <span className="block text-[12px] text-dash-muted">Masuk sebagai admin</span>
                </span>
              </div>
              <div className="border-t border-dash-line-soft pt-1">
                <MenuItem href="/" icon="external">
                  Lihat situs
                </MenuItem>
                <form action={logoutAction}>
                  <PendingButton className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] font-medium text-dash-off-fg transition-colors hover:bg-dash-off-bg disabled:opacity-60">
                    <Icon name="logout" className="h-4 w-4 text-dash-faint" />
                    Keluar
                  </PendingButton>
                </form>
              </div>
            </Menu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7 2xl:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
