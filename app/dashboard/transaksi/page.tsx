import { Suspense } from "react";
import Link from "next/link";
import { approveOrderAction, rejectOrderAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { listSales } from "@/lib/sales";
import { InlineConfirm, ProofPreview, SearchBox } from "../menu";
import { greeting, shortDate, timeOfDay, todayLine } from "../greeting";
import {
  Avatar,
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
    return [order.fullName, order.email, order.whatsapp, order.plan, order.ticketNo ?? ""]
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
        sub="Setujui bukti transfer yang masuk. ACC akan menerbitkan nomor tiket dan mengirim email ke peserta."
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

      {query.saved === "1" ? <Notice tone="ok">Tiket terkirim ke email peserta.</Notice> : null}
      {query.error ? <Notice tone="off">{query.error}</Notice> : null}
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
            <SearchBox defaultValue={q} placeholder="Cari nama, email, atau nomor tiket" />
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
          minWidth="980px"
          cols={[
            { key: "peserta", label: "Peserta", width: "24%" },
            { key: "kontak", label: "Kontak", width: "20%" },
            { key: "paket", label: "Paket", width: "20%" },
            { key: "bukti", label: "Bukti", width: "100px" },
            { key: "status", label: "Status", width: "150px" },
            { key: "aksi", label: "Aksi", width: "182px", align: "right" },
          ]}
        >
          {orders.map((order) => (
            <tr key={order.id}>
              <Td>
                <span className="flex items-center gap-2.5">
                  <Avatar name={order.fullName} size={30} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-dash-ink">{order.fullName}</span>
                    <Meta>{order.email}</Meta>
                  </span>
                </span>
              </Td>
              <Td>
                <span className="block truncate">{order.whatsapp}</span>
                <Meta>{order.institution}</Meta>
              </Td>
              <Td>
                <span className="block font-medium">{order.plan}</span>
                <Meta>
                  {order.amount} · {shortDate(order.createdAt)} {timeOfDay(order.createdAt)}
                </Meta>
              </Td>
              <Td>
                <ProofPreview
                  src={`/dashboard/bukti/${order.id}`}
                  name={`${order.fullName} · ${order.plan}`}
                />
              </Td>
              <Td>
                <OrderStatus status={order.status} />
                {order.ticketNo ? <Meta>{order.ticketNo}</Meta> : null}
              </Td>
              <Td align="right">
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
                ) : (
                  <span className="text-[12.5px] text-dash-muted">
                    {order.status === "approved" ? "Sudah diterbitkan" : "Tidak diterbitkan"}
                  </span>
                )}
              </Td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6}>
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
