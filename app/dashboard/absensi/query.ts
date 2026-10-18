import type { Order } from "@/lib/sales";

/* Logika daftar absensi dipakai dua tempat: halaman tabel dan unduhan Excel.
   Supaya hasil pencarian, filter, dan urutan di keduanya selalu sama. */

export const SORTS = [
  { key: "nama", label: "Nama (A–Z)" },
  { key: "tanggal", label: "Tanggal pesan" },
  { key: "kategori", label: "Kategori tiket" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];

export const HADIR_FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "belum", label: "Belum hadir" },
  { key: "hadir", label: "Hadir" },
] as const;

export type HadirKey = (typeof HADIR_FILTERS)[number]["key"];

export type AbsensiQuery = {
  q: string;
  sort: SortKey;
  kategori: string;
  hadir: HadirKey;
  scan: string;
};

/** Baca parameter URL dengan nilai bawaan yang aman. */
export function readQuery(raw: Record<string, string | string[] | undefined>): AbsensiQuery {
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] ?? "" : value ?? "");
  const sortRaw = one(raw.sort);
  const hadirRaw = one(raw.hadir);
  return {
    q: one(raw.q).trim(),
    sort: (SORTS.find((sort) => sort.key === sortRaw)?.key ?? "nama") as SortKey,
    kategori: one(raw.kategori).trim(),
    hadir: (HADIR_FILTERS.find((filter) => filter.key === hadirRaw)?.key ?? "semua") as HadirKey,
    scan: one(raw.scan).trim(),
  };
}

/** Susun query aktif jadi string pencarian untuk tautan filter & unduhan. */
export function backQuery(query: AbsensiQuery, extra: Partial<Record<string, string>> = {}) {
  const params = new URLSearchParams();
  const merged = {
    q: query.q,
    sort: query.sort === "nama" ? "" : query.sort,
    kategori: query.kategori,
    hadir: query.hadir === "semua" ? "" : query.hadir,
    scan: query.scan,
    ...extra,
  };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

const collator = new Intl.Collator("id", { sensitivity: "base", numeric: true });

/** Terapkan pencarian, filter kategori/kehadiran, dan urutan. */
export function applyAbsensi(attendees: Order[], query: AbsensiQuery) {
  const needle = query.q.toLowerCase();

  const filtered = attendees.filter((order) => {
    if (query.kategori && order.plan !== query.kategori) return false;
    if (query.hadir === "hadir" && !order.checkedInAt) return false;
    if (query.hadir === "belum" && order.checkedInAt) return false;
    if (!needle) return true;
    return [
      order.fullName,
      order.email,
      order.whatsapp,
      order.institution,
      order.jobTitle,
      order.plan,
      order.ticketNo ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const sorted = [...filtered];
  if (query.sort === "tanggal") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else if (query.sort === "kategori") {
    sorted.sort(
      (a, b) => collator.compare(a.plan, b.plan) || collator.compare(a.fullName, b.fullName),
    );
  } else {
    sorted.sort((a, b) => collator.compare(a.fullName, b.fullName));
  }
  return sorted;
}
