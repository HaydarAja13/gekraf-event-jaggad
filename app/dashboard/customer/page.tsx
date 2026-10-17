import { Suspense } from "react";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { listCustomers } from "@/lib/sales";
import { SearchBox } from "../menu";
import { referralDetail } from "@/lib/referral";
import { greeting, longDate, todayLine } from "../greeting";
import {
  Avatar,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Meta,
  OrderStatus,
  PageHead,
  Pill,
  TableShell,
  Td,
} from "../ui";

export default function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<CustomerFallback />}>
      <CustomerList searchParams={searchParams} />
    </Suspense>
  );
}

function CustomerFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-48 rounded-lg bg-dash-line-soft" />
      <div className="h-11 w-full max-w-md rounded-[10px] bg-dash-surface" />
      <div className="h-80 rounded-[14px] border border-dash-line bg-dash-surface" />
    </div>
  );
}

async function CustomerList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = await searchParams;
  const [customers, admin] = await Promise.all([listCustomers(), getAdmin()]);
  const q = (query.q ?? "").trim().toLowerCase();

  const rows = customers.filter((customer) => {
    if (!q) return true;
    return [customer.fullName, customer.email, customer.whatsapp, customer.institution, customer.jobTitle]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const withOrders = customers.filter((customer) => customer.orders.length > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Data peserta diambil dari formulir checkout dan dihubungkan ke orderannya."
        actions={
          <>
            <BtnLink href="/dashboard/transaksi" icon="receipt">
              Ke transaksi
            </BtnLink>
            <BtnLink href="/" icon="external" target="_blank" rel="noreferrer">
              Lihat situs
            </BtnLink>
          </>
        }
      />

      <Card>
        <CardHead
          icon="users"
          title="Daftar customer"
          meta={
            <>
              <Pill tone="neutral">{customers.length} customer</Pill>
              <Pill tone="ok">{withOrders} punya order</Pill>
            </>
          }
        />

        <div className="px-[var(--dash-gutter)] pb-3.5">
          <div className="w-full sm:max-w-[340px] xl:max-w-[420px]">
            <SearchBox defaultValue={q} placeholder="Cari nama, email, atau instansi" />
          </div>
        </div>

        <TableShell
          minWidth="960px"
          cols={[
            { key: "customer", label: "Customer", width: "28%" },
            { key: "kontak", label: "Kontak", width: "24%" },
            { key: "instansi", label: "Instansi", width: "22%" },
            { key: "order", label: "Order", width: "26%" },
          ]}
        >
          {rows.map((customer) => (
            <tr key={customer.id}>
              <Td>
                <span className="flex items-start gap-2.5">
                  <Avatar name={customer.fullName} size={32} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-dash-ink">
                      {customer.fullName}
                    </span>
                    <Meta>Terdaftar {longDate(customer.createdAt)}</Meta>
                    {customer.address ? <Meta>{customer.address}</Meta> : null}
                  </span>
                </span>
              </Td>
              <Td>
                <a
                  href={`mailto:${customer.email}`}
                  className="block truncate font-medium text-dash-ink hover:text-dash-fill-hover hover:underline"
                >
                  {customer.email}
                </a>
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-dash-muted hover:text-dash-fill-hover hover:underline"
                >
                  {customer.whatsapp}
                </a>
              </Td>
              <Td>
                <span className="block font-medium">{customer.institution || "—"}</span>
                <Meta>{customer.jobTitle || "—"}</Meta>
              </Td>
              <Td>
                {customer.orders.length === 0 ? (
                  <span className="text-dash-muted">Belum ada order</span>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {customer.orders.map((order) => (
                      <li key={order.id} className="flex flex-wrap items-center gap-2">
                        <span className="min-w-0">
                          <span className="block font-semibold text-dash-ink">{order.plan}</span>
                          <Meta>
                            {order.amount}
                            {order.ticketNo ? ` · ${order.ticketNo}` : ""} · {referralDetail(order)} ·{" "}
                            {longDate(order.createdAt)}
                          </Meta>
                        </span>
                        <OrderStatus status={order.status} short />
                      </li>
                    ))}
                  </ul>
                )}
              </Td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>
                {customers.length === 0 ? (
                  <EmptyState
                    icon="users"
                    title="Belum ada customer"
                    body="Setiap orang yang mengisi formulir pendaftaran akan tercatat di sini bersama orderannya."
                    action={<BtnLink href="/" size="sm" icon="external">Buka halaman pendaftaran</BtnLink>}
                  />
                ) : (
                  <EmptyState
                    icon="search"
                    title="Tidak ada customer yang cocok"
                    body={`Tidak ditemukan customer untuk pencarian "${q}". Coba kata kunci lain.`}
                    action={
                      <Link href="/dashboard/customer" className="text-[13px] font-semibold text-dash-fill-hover underline underline-offset-2">
                        Tampilkan semua customer
                      </Link>
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
