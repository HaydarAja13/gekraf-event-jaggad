import { Suspense } from "react";
import Link from "next/link";
import { updateCustomerAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { listCustomers } from "@/lib/sales";
import { Flash } from "@/app/toast";
import { SearchBox } from "../menu";
import { greeting, orderStamp, todayLine } from "../greeting";
import {
  Btn,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Field,
  Icon,
  PageHead,
  Pill,
  TableShell,
  Td,
  inputClass,
} from "../ui";

export default function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string; saved?: string; error?: string }>;
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
  searchParams: Promise<{ q?: string; edit?: string; saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const [customers, admin] = await Promise.all([listCustomers(), getAdmin()]);
  const search = (query.q ?? "").trim();
  const q = search.toLowerCase();
  const editing = customers.find((customer) => customer.id === query.edit) ?? null;
  const knownError = ["invalid", "taken", "notfound"].includes(query.error ?? "");
  const backHref = q ? `/dashboard/customer?q=${encodeURIComponent(search)}` : "/dashboard/customer";

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

      <Flash
        items={[
          query.saved === "1"
            ? {
                tone: "ok" as const,
                text: "Data customer tersimpan. Email tiket dan tombol WhatsApp di transaksinya ikut diperbarui.",
              }
            : null,
          query.error === "invalid"
            ? {
                tone: "off" as const,
                text: "Nama, email, atau nomor WhatsApp belum benar. Nomor WhatsApp minimal 9 digit.",
              }
            : null,
          query.error === "taken"
            ? { tone: "warn" as const, text: "Email itu sudah dipakai customer lain. Gunakan email yang berbeda." }
            : null,
          query.error === "notfound"
            ? { tone: "warn" as const, text: "Customer tidak ditemukan. Mungkin datanya sudah dihapus." }
            : null,
          query.error && !knownError ? { tone: "off" as const, text: query.error } : null,
        ].filter((item) => item !== null)}
      />

      {editing ? (
        <Card padded>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Icon name="pencil" className="h-[18px] w-[18px] text-dash-muted" />
                <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">Edit customer</h2>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dash-muted">
                Perubahan juga dipakai di {editing.orders.length} transaksi customer ini, termasuk email tiket dan
                tombol kirim lewat WhatsApp.
              </p>
            </div>
            <BtnLink href={backHref} size="sm" variant="ghost" icon="x">
              Batal
            </BtnLink>
          </div>

          <form action={updateCustomerAction} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={editing.id} />
            {search ? <input type="hidden" name="q" value={search} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field id="fullName" label="Nama lengkap" required>
                <input id="fullName" name="fullName" required defaultValue={editing.fullName} className={inputClass} />
              </Field>
              <Field
                id="email"
                label="Email"
                required
                hint="Dipakai untuk mengirim tiket dan menerima pembaruan dari panitia."
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={editing.email}
                  className={inputClass}
                />
              </Field>
              <Field
                id="whatsapp"
                label="Nomor WhatsApp"
                required
                hint="Dipakai tombol kirim tiket lewat WA di tabel transaksi."
              >
                <input
                  id="whatsapp"
                  name="whatsapp"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={editing.whatsapp}
                  placeholder="0822-4198-9936"
                  className={inputClass}
                />
              </Field>
              <Field id="institution" label="Instansi">
                <input id="institution" name="institution" defaultValue={editing.institution} className={inputClass} />
              </Field>
              <Field id="jobTitle" label="Jabatan">
                <input id="jobTitle" name="jobTitle" defaultValue={editing.jobTitle} className={inputClass} />
              </Field>
              <Field id="address" label="Alamat" hint="Alamat tidak wajib diisi ulang.">
                <input id="address" name="address" defaultValue={editing.address} className={inputClass} />
              </Field>
            </div>
            <div className="flex items-center gap-2 border-t border-dash-line-soft pt-4">
              <Btn type="submit" variant="primary" icon="check">
                Simpan perubahan
              </Btn>
              <BtnLink href={backHref} variant="ghost">
                Batal
              </BtnLink>
            </div>
          </form>
        </Card>
      ) : null}

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
            <SearchBox action="/dashboard/customer" defaultValue={search} placeholder="Cari nama, email, atau instansi" />
          </div>
        </div>

        <TableShell
          dense
          minWidth="1206px"
          cols={[
            { key: "nama", label: "Nama", width: "150px" },
            { key: "email", label: "Email", width: "200px" },
            { key: "whatsapp", label: "WhatsApp", width: "140px" },
            { key: "instansi", label: "Instansi", width: "140px" },
            { key: "jabatan", label: "Jabatan", width: "140px" },
            { key: "alamat", label: "Alamat", width: "180px" },
            { key: "daftar", label: "Tgl. daftar", width: "156px" },
            { key: "aksi", label: "Aksi", width: "100px", align: "right" },
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
              <Td dense align="right">
                <BtnLink
                  href={`/dashboard/customer?edit=${customer.id}${q ? `&q=${encodeURIComponent(search)}` : ""}`}
                  size="sm"
                  icon="pencil"
                  aria-label={`Edit customer ${customer.fullName}`}
                >
                  Edit
                </BtnLink>
              </Td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8}>
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
