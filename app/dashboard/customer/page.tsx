import { Suspense } from "react";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { listCustomers } from "@/lib/sales";
import { SearchBox } from "../menu";
import { greeting, orderStamp, todayLine } from "../greeting";
import {
  BtnLink,
  Card,
  CardHead,
  EmptyState,
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
        sub="Data peserta diambil dari formulir checkout dan dihubungkan ke riwayat transaksi dan tiketnya."
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
            <SearchBox action="/dashboard/customer" defaultValue={q} placeholder="Cari nama, email, atau instansi" />
          </div>
        </div>

        <TableShell
          dense
          minWidth="1106px"
          cols={[
            { key: "nama", label: "Nama", width: "150px" },
            { key: "email", label: "Email", width: "200px" },
            { key: "whatsapp", label: "WhatsApp", width: "140px" },
            { key: "instansi", label: "Instansi", width: "140px" },
            { key: "jabatan", label: "Jabatan", width: "140px" },
            { key: "alamat", label: "Alamat", width: "180px" },
            { key: "daftar", label: "Tgl. daftar", width: "156px" },
          ]}
        >
          {rows.map((customer) => (
            <tr key={customer.id}>
              <Td dense>
                <span className="block truncate font-semibold text-dash-ink" title={customer.fullName}>
                  {customer.fullName}
                </span>
              </Td>
              <Td dense>
                <a
                  href={`mailto:${customer.email}`}
                  title={customer.email}
                  className="block truncate text-dash-ink hover:text-dash-fill-hover hover:underline"
                >
                  {customer.email}
                </a>
              </Td>
              <Td dense>
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noreferrer"
                  title={customer.whatsapp}
                  className="block truncate whitespace-nowrap text-dash-ink hover:text-dash-fill-hover hover:underline"
                >
                  {customer.whatsapp}
                </a>
              </Td>
              <Td dense>
                <span className="block truncate" title={customer.institution || undefined}>
                  {customer.institution || "—"}
                </span>
              </Td>
              <Td dense>
                <span className="block truncate" title={customer.jobTitle || undefined}>
                  {customer.jobTitle || "—"}
                </span>
              </Td>
              <Td dense>
                <span className="block truncate" title={customer.address || undefined}>
                  {customer.address || "—"}
                </span>
              </Td>
              <Td dense>
                <span className="tnum block whitespace-nowrap text-[13px]">{orderStamp(customer.createdAt)}</span>
              </Td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>
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
