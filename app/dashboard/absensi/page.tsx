import { Suspense } from "react";
import { markPresentAction, undoAttendanceAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { listAttendees } from "@/lib/sales";
import { InlineConfirm, SearchBox } from "../menu";
import { greeting, orderStamp, timeOfDay, todayLine } from "../greeting";
import { Flash } from "@/app/toast";
import {
  Btn,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Highlight,
  Icon,
  Meta,
  PageHead,
  Pill,
  StatStrip,
  TableShell,
  Td,
} from "../ui";
import {
  HADIR_FILTERS,
  SORTS,
  applyAbsensi,
  backQuery,
  readQuery,
  type AbsensiQuery,
} from "./query";
import { QrScanner } from "./scanner";

export default function AbsensiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<AbsensiFallback />}>
      <Absensi searchParams={searchParams} />
    </Suspense>
  );
}

function AbsensiFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-40 rounded-lg bg-dash-line-soft" />
      <div className="h-11 w-full max-w-md rounded-[10px] bg-dash-surface" />
      <div className="h-80 rounded-[14px] border border-dash-line bg-dash-surface" />
    </div>
  );
}

/* Status kehadiran peserta: hadir (lengkap waktu check-in) atau belum. */
function HadirPill({ at }: { at: string | null }) {
  return at ? (
    <Pill tone="ok">
      <Icon name="checkCircle" className="h-3.5 w-3.5" />
      Hadir · {timeOfDay(at)}
    </Pill>
  ) : (
    <Pill tone="neutral">
      <Icon name="circle" className="h-3.5 w-3.5" />
      Belum hadir
    </Pill>
  );
}

function filterHref(query: AbsensiQuery, extra: Record<string, string>) {
  const params = backQuery(query, extra);
  return params ? `/dashboard/absensi?${params}` : "/dashboard/absensi";
}

async function Absensi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const [attendees, admin] = await Promise.all([listAttendees(), getAdmin()]);
  const query = readQuery(raw);
  const saved = Array.isArray(raw.saved) ? raw.saved[0] : raw.saved;
  const error = Array.isArray(raw.error) ? raw.error[0] : raw.error;
  const rows = applyAbsensi(attendees, query);

  const hadirCount = attendees.filter((order) => order.checkedInAt).length;
  const categories = [...new Set(attendees.map((order) => order.plan))].sort((a, b) =>
    a.localeCompare(b, "id"),
  );

  /* Query untuk tombol aksi per baris: bawa semua filter aktif supaya admin
     kembali ke tampilan yang sama setelah menandai / membatalkan. */
  const back = backQuery(query);

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Daftar peserta yang pembayarannya sudah di-ACC. Pindai QR tiket atau tandai manual, lalu unduh daftarnya sebagai Excel untuk rekap kehadiran."
        actions={
          <BtnLink
            href={`/dashboard/absensi/excel?${back}`}
            icon="download"
            variant="outline"
            title="Unduh daftar sesuai filter yang sedang aktif"
          >
            Export Excel
          </BtnLink>
        }
      />

      <Flash
        items={[
          saved === "hadir"
            ? { tone: "ok" as const, text: "Kehadiran peserta dicatat." }
            : saved === "batal"
              ? { tone: "warn" as const, text: "Kehadiran peserta dibatalkan." }
              : query.scan
                ? { tone: "ok" as const, text: `Check-in berhasil: ${query.scan}` }
                : null,
          error ? { tone: "off" as const, text: error } : null,
        ].filter((item) => item !== null)}
      />

      <StatStrip
        items={[
          { icon: "users", value: String(attendees.length), label: "Peserta ACC" },
          {
            icon: "checkCircle",
            value: String(hadirCount),
            label: "Hadir",
            hint: `${attendees.length > 0 ? Math.round((hadirCount / attendees.length) * 100) : 0}%`,
          },
          { icon: "circle", value: String(attendees.length - hadirCount), label: "Belum hadir" },
          { icon: "ticket", value: String(categories.length), label: "Kategori tiket" },
        ]}
      />

      <Card>
        <CardHead
          icon="camera"
          title="Check-in peserta"
          meta={
            <span className="text-[12.5px] text-dash-muted">
              Pindai QR pada tiket email, atau ketik no. tiket manual
            </span>
          }
        />
        <div className="px-[var(--dash-gutter)] pb-4">
          <QrScanner />
        </div>
      </Card>

      <Card>
        <CardHead
          icon="list"
          title="Daftar peserta"
          meta={
            <Pill tone="neutral">
              {rows.length}
              {rows.length !== attendees.length ? ` dari ${attendees.length}` : ""} peserta
            </Pill>
          }
          right={
            <span className="flex items-center gap-2 text-[12.5px] text-dash-muted">
              Urutkan:
              <span className="flex flex-wrap items-center gap-1">
                {SORTS.map((sort) => {
                  const active = sort.key === query.sort;
                  return (
                    <a
                      key={sort.key}
                      href={filterHref(query, { sort: sort.key })}
                      aria-current={active ? "true" : undefined}
                      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-[12px] font-semibold transition-colors ${
                        active
                          ? "border-transparent bg-dash-fill text-white"
                          : "border-dash-line text-dash-muted hover:bg-dash-bg hover:text-dash-ink"
                      }`}
                    >
                      {sort.label}
                    </a>
                  );
                })}
              </span>
            </span>
          }
        />

        <div className="flex flex-wrap items-center gap-2 px-[var(--dash-gutter)] pb-3.5">
          <div className="w-full min-w-56 flex-1 sm:max-w-[340px]">
            <SearchBox
              action="/dashboard/absensi"
              defaultValue={query.q}
              placeholder="Cari nama, no. tiket, instansi..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <a
              href={filterHref(query, { kategori: "" })}
              aria-current={!query.kategori ? "true" : undefined}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition-colors ${
                !query.kategori
                  ? "border-transparent bg-dash-fill text-white"
                  : "border-dash-line text-dash-muted hover:bg-dash-bg hover:text-dash-ink"
              }`}
            >
              Semua kategori
            </a>
            {categories.map((kategori) => {
              const active = query.kategori === kategori;
              return (
                <a
                  key={kategori}
                  href={filterHref(query, { kategori })}
                  aria-current={active ? "true" : undefined}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition-colors ${
                    active
                      ? "border-transparent bg-dash-fill text-white"
                      : "border-dash-line text-dash-muted hover:bg-dash-bg hover:text-dash-ink"
                  }`}
                >
                  {kategori}
                </a>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {HADIR_FILTERS.map((filter) => {
              const active = filter.key === query.hadir;
              const count =
                filter.key === "hadir"
                  ? hadirCount
                  : filter.key === "belum"
                    ? attendees.length - hadirCount
                    : attendees.length;
              return (
                <a
                  key={filter.key}
                  href={filterHref(query, { hadir: filter.key })}
                  aria-current={active ? "true" : undefined}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition-colors ${
                    active
                      ? "border-transparent bg-dash-fill text-white"
                      : "border-dash-line text-dash-muted hover:bg-dash-bg hover:text-dash-ink"
                  }`}
                >
                  {filter.label}
                  <span className={`tnum ${active ? "text-white" : "text-dash-muted"}`}>{count}</span>
                </a>
              );
            })}
          </div>
        </div>

        <TableShell
          dense
          minWidth="1120px"
          cols={[
            { key: "no", label: "No", width: "48px" },
            { key: "peserta", label: "Peserta", width: "220px" },
            { key: "tiket", label: "No. Tiket", width: "118px" },
            { key: "kategori", label: "Kategori", width: "120px" },
            { key: "instansi", label: "Instansi / Jabatan", width: "180px" },
            { key: "tanggal", label: "Tgl. pesan", width: "140px" },
            { key: "kehadiran", label: "Kehadiran", width: "150px" },
            { key: "aksi", label: "Aksi", width: "170px", align: "right" },
          ]}
        >
          {rows.map((order, index) => (
            <tr
              key={order.id}
              className={query.scan && order.ticketNo === query.scan ? "bg-dash-ok-bg/60" : undefined}
            >
              <Td dense>
                <span className="tnum text-[12.5px] text-dash-muted">{index + 1}</span>
              </Td>
              <Td dense>
                <span className="block truncate font-semibold text-dash-ink">
                  <Highlight text={order.fullName} query={query.q} />
                </span>
                <a
                  href={`mailto:${order.email}`}
                  className="block truncate text-[12.5px] leading-5 text-dash-muted hover:text-dash-fill-hover hover:underline"
                >
                  <Highlight text={order.email} query={query.q} />
                </a>
              </Td>
              <Td dense>
                <span className="block whitespace-nowrap font-mono text-[13px] font-semibold tracking-wide text-dash-ink">
                  <Highlight text={order.ticketNo ?? "—"} query={query.q} />
                </span>
              </Td>
              <Td dense>
                <span className="block truncate font-semibold text-dash-ink">
                  <Highlight text={order.plan} query={query.q} />
                </span>
              </Td>
              <Td dense>
                <span className="block truncate text-dash-ink">
                  <Highlight text={order.institution || "—"} query={query.q} />
                </span>
                <Meta>{order.jobTitle || "—"}</Meta>
              </Td>
              <Td dense>
                <span className="tnum block whitespace-nowrap text-[13px]">
                  {orderStamp(order.createdAt)}
                </span>
              </Td>
              <Td dense>
                <HadirPill at={order.checkedInAt} />
                {order.checkedInAt ? (
                  <Meta>
                    oleh {order.checkedInBy ?? "—"}
                  </Meta>
                ) : null}
              </Td>
              <Td dense align="right">
                {order.checkedInAt ? (
                  <InlineConfirm
                    trigger={
                      <Btn variant="danger" size="sm" icon="x" aria-label={`Batalkan kehadiran ${order.fullName}`}>
                        Batalkan
                      </Btn>
                    }
                    confirm={
                      <form action={undoAttendanceAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="back" value={back} />
                        <Btn type="submit" variant="danger" size="sm" className="border-dash-off-fg/30">
                          Yakin batal?
                        </Btn>
                      </form>
                    }
                  />
                ) : (
                  <form action={markPresentAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="back" value={back} />
                    <Btn type="submit" variant="primary" size="sm" icon="check">
                      Tandai hadir
                    </Btn>
                  </form>
                )}
              </Td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
                {attendees.length === 0 ? (
                  <EmptyState
                    icon="users"
                    title="Belum ada peserta yang di-ACC"
                    body="Absensi terisi otomatis begitu pembayaran peserta Anda ACC di halaman Transaksi."
                    action={
                      <BtnLink href="/dashboard/transaksi" size="sm" icon="receipt">
                        Buka transaksi
                      </BtnLink>
                    }
                  />
                ) : (
                  <EmptyState
                    icon="search"
                    title="Tidak ada peserta yang cocok"
                    body={`Tidak ditemukan peserta untuk pencarian "${query.q}" dengan filter ini. Coba kata kunci lain atau reset filternya.`}
                    action={
                      <BtnLink href="/dashboard/absensi" size="sm" icon="x">
                        Reset filter
                      </BtnLink>
                    }
                  />
                )}
              </td>
            </tr>
          ) : null}
        </TableShell>
      </Card>
    </div>
  );
}
