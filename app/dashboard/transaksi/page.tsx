import { Suspense } from "react";
import Link from "next/link";
import { approveOrderAction, rejectOrderAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { listSales } from "@/lib/sales";
import { InlineConfirm, ProofPreview, SearchBox } from "../menu";
import { formatIdr } from "@/lib/referral";
import { greeting, orderStamp, todayLine } from "../greeting";
import { Flash } from "@/app/toast";
import {
  Btn,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Meta,
  Notice,
  OrderStatus,
  PageHead,
  Pill,
  TableShell,
  Td,
  btnClass,
} from "../ui";

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Menunggu ACC" },
  { key: "approved", label: "ACC" },
  { key: "rejected", label: "Ditolak" },
];

export default function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; saved?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<TransaksiFallback />}>
      <Transaksi searchParams={searchParams} />
    </Suspense>
  );
}

function TransaksiFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-44 rounded-lg bg-dash-line-soft" />
      <div className="h-11 w-full max-w-md rounded-[10px] bg-dash-surface" />
      <div className="h-80 rounded-[14px] border border-dash-line bg-dash-surface" />
    </div>
  );
}

async function Transaksi({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const [db, admin] = await Promise.all([listSales(), getAdmin()]);
  const q = (query.q ?? "").trim();
  const needle = q.toLowerCase();
  const status = FILTERS.some((filter) => filter.key === query.status) ? query.status! : "semua";

  const counts = {
    semua: db.orders.length,
    pending: db.orders.filter((order) => order.status === "pending").length,
    approved: db.orders.filter((order) => order.status === "approved").length,
    rejected: db.orders.filter((order) => order.status === "rejected").length,
  };

  const orders = db.orders.filter((order) => {
    if (status !== "semua" && order.status !== status) return false;
    if (!needle) return true;
    return [order.fullName, order.email, order.whatsapp, order.plan, order.ticketNo ?? "", order.referralCode ?? "", order.referralName ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const filtered = Boolean(needle) || status !== "semua";

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Kelola pendaftaran dan bukti transfer. ACC transaksi untuk mengaktifkan tiket dan mengirimkannya via email ke peserta."
        actions={
          <>
            <BtnLink href="/dashboard/pembayaran" icon="card">
              Rekening tujuan
            </BtnLink>
            <BtnLink href="/" icon="external" target="_blank" rel="noreferrer">
              Lihat situs
            </BtnLink>
          </>
        }
      />

      <Flash
        items={[
          query.saved === "1" ? { tone: "ok" as const, text: "Tiket terkirim ke email peserta." } : null,
          query.error ? { tone: "off" as const, text: query.error } : null,
        ].filter((item) => item !== null)}
      />
      {counts.pending > 0 && status !== "pending" ? (
        <Notice tone="wait">
          {counts.pending} pembayaran menunggu ACC.{" "}
          <Link href="/dashboard/transaksi?status=pending" className="font-semibold underline underline-offset-2">
            Tampilkan yang menunggu saja
          </Link>
        </Notice>
      ) : null}

      <Card>
        <CardHead
          icon="receipt"
          title="Daftar transaksi"
          meta={
            <Pill tone="neutral">
              {orders.length}
              {filtered ? ` dari ${counts.semua}` : ""} transaksi
            </Pill>
          }
        />

        <div className="flex flex-wrap items-center gap-2 px-[var(--dash-gutter)] pb-3.5">
          <div className="w-full min-w-56 flex-1 sm:max-w-[340px]">
            <SearchBox action="/dashboard/transaksi" defaultValue={q} placeholder="Cari nama, email, atau nomor tiket" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((filter) => {
              const active = filter.key === status;
              const params = new URLSearchParams();
              if (filter.key !== "semua") params.set("status", filter.key);
              if (q) params.set("q", q);
              const href = params.size ? `/dashboard/transaksi?${params}` : "/dashboard/transaksi";
              return (
                <Link
                  key={filter.key}
                  href={href}
                  aria-current={active ? "true" : undefined}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition-colors ${
                    active
                      ? "border-transparent bg-dash-fill text-white"
                      : "border-dash-line text-dash-muted hover:bg-dash-bg hover:text-dash-ink"
                  }`}
                >
                  {filter.label}
                  <span className={`tnum ${active ? "text-white" : "text-dash-muted"}`}>
                    {counts[filter.key as keyof typeof counts]}
                  </span>
                </Link>
              );
            })}
          </div>
          {filtered ? (
            <BtnLink href="/dashboard/transaksi" size="sm" variant="ghost" icon="x" className="ml-auto">
              Reset filter
            </BtnLink>
          ) : null}
        </div>

        <TableShell
          dense
          minWidth="1106px"
          cols={[
            { key: "tiket", label: "No. Tiket", width: "112px" },
            { key: "peserta", label: "Peserta", width: "130px" },
            { key: "kontak", label: "Kontak", width: "118px" },
            { key: "paket", label: "Paket", width: "110px" },
            { key: "referral", label: "Referral", width: "100px" },
            { key: "bukti", label: "Bukti pembayaran", width: "100px" },
            { key: "tanggal", label: "Tgl. pesan", width: "156px" },
            { key: "status", label: "Status", width: "112px" },
            { key: "aksi", label: "Aksi", width: "168px", align: "right" },
          ]}
        >
          {orders.map((order) => (
            <tr key={order.id}>
              <Td dense>
                <span className="block whitespace-nowrap font-mono text-[13px] font-semibold tracking-wide text-dash-ink">
                  {order.ticketNo ?? "—"}
                </span>
              </Td>
              <Td dense>
                <span className="block truncate font-semibold text-dash-ink">{order.fullName}</span>
                <a
                  href={`mailto:${order.email}`}
                  className="block truncate text-[12.5px] leading-5 text-dash-muted hover:text-dash-fill-hover hover:underline"
                >
                  {order.email}
                </a>
              </Td>
              <Td dense>
                <a
                  href={`https://wa.me/${order.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-medium text-dash-ink hover:text-dash-fill-hover hover:underline"
                >
                  {order.whatsapp}
                </a>
                <Meta>{order.institution || "—"}</Meta>
              </Td>
              <Td dense>
                <span className="block truncate font-semibold text-dash-ink">{order.plan}</span>
                <Meta>{order.amount}</Meta>
              </Td>
              <Td dense>
                {order.referralCode ? (
                  <>
                    <span className="block truncate font-semibold text-dash-ink">{order.referralCode}</span>
                    <Meta>Potongan {formatIdr(order.discountAmount)}</Meta>
                  </>
                ) : (
                  <span className="text-dash-muted">—</span>
                )}
              </Td>
              <Td dense>
                <ProofPreview
                  src={`/dashboard/bukti/${order.id}`}
                  name={`${order.fullName} · ${order.plan}`}
                />
              </Td>
              <Td dense>
                <span className="tnum block whitespace-nowrap text-[13px]">{orderStamp(order.createdAt)}</span>
              </Td>
              <Td dense>
                <OrderStatus status={order.status} short />
              </Td>
              <Td dense align="right">
                {order.status === "pending" ? (
                  <span className="flex items-center justify-end gap-2">
                    <form action={approveOrderAction}>
                      <input type="hidden" name="id" value={order.id} />
                      <Btn type="submit" variant="primary" size="sm" icon="check">
                        ACC
                      </Btn>
                    </form>
                    <InlineConfirm
                      trigger={
                        <Btn variant="danger" size="sm" icon="x" aria-label={`Tolak transaksi ${order.fullName}`}>
                          Tolak
                        </Btn>
                      }
                      confirm={
                        <form action={rejectOrderAction}>
                          <input type="hidden" name="id" value={order.id} />
                          <Btn type="submit" variant="danger" size="sm" className="border-dash-off-fg/30">
                            Yakin tolak?
                          </Btn>
                        </form>
                      }
                    />
                  </span>
                ) : order.status === "approved" ? (
                  <span className="flex items-center justify-end gap-2">
                    <span className="text-[12px] font-medium text-dash-ok-fg">Diterbitkan</span>
                    {order.ticketNo ? (
                      <a
                        href={`/tiket/${encodeURIComponent(order.ticketNo)}`}
                        target="_blank"
                        rel="noreferrer"
                        className={btnClass("outline", "sm")}
                      >
                        Lihat
                      </a>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-[12.5px] text-dash-muted">Ditolak</span>
                )}
              </Td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9}>
                {counts.semua === 0 ? (
                  <EmptyState
                    icon="receipt"
                    title="Belum ada transaksi masuk"
                    body="Pendaftaran dari halaman checkout akan muncul di sini lengkap dengan bukti transfer, siap Anda ACC."
                    action={<BtnLink href="/" size="sm" icon="external">Buka halaman pendaftaran</BtnLink>}
                  />
                ) : (
                  <EmptyState
                    icon="search"
                    title="Tidak ada transaksi yang cocok"
                    body={`Tidak ditemukan transaksi untuk pencarian "${q}" dengan filter ini. Coba kata kunci lain atau reset filternya.`}
                    action={<BtnLink href="/dashboard/transaksi" size="sm" icon="x">Reset filter</BtnLink>}
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
