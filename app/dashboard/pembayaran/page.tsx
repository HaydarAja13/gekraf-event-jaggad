import { Suspense } from "react";
import { addAccountAction, removeAccountAction, updateAccountAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { listSales } from "@/lib/sales";
import { CopyButton, InlineConfirm } from "../menu";
import { greeting, todayLine } from "../greeting";
import {
  Btn,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Field,
  Icon,
  Meta,
  Notice,
  PageHead,
  Pill,
  inputClass,
} from "../ui";

export default function PembayaranPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  return (
    <Suspense fallback={<PembayaranFallback />}>
      <Pembayaran searchParams={searchParams} />
    </Suspense>
  );
}

function PembayaranFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-44 rounded-lg bg-dash-line-soft" />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="h-72 rounded-[14px] border border-dash-line bg-dash-surface" />
        <div className="h-72 rounded-[14px] border border-dash-line bg-dash-surface" />
      </div>
    </div>
  );
}

async function Pembayaran({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  const query = await searchParams;
  const [db, admin] = await Promise.all([listSales(), getAdmin()]);
  const editing = db.accounts.find((account) => account.id === query.edit) ?? null;
  const empty = query.error === "1";

  const used = new Map<string, number>();
  for (const order of db.orders) {
    used.set(order.accountId, (used.get(order.accountId) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Rekening ini yang ditampilkan ke peserta saat checkout. Pastikan nama bank dan nomornya benar sebelum peserta transfer."
        actions={
          <BtnLink href="/dashboard/transaksi" icon="receipt">
            Ke transaksi
          </BtnLink>
        }
      />

      {query.saved === "1" ? <Notice tone="ok">Rekening tersimpan.</Notice> : null}
      {query.error === "1" ? (
        <Notice tone="off">Nama bank, nama rekening, dan nomor rekening wajib diisi.</Notice>
      ) : null}
      {query.error === "used" ? (
        <Notice tone="warn">
          Rekening ini sudah dipakai pada transaksi sehingga tidak bisa dihapus. Edit datanya kalau memang
          ada yang salah.
        </Notice>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card>
          <CardHead
            icon="card"
            title="Rekening tujuan"
            meta={<Pill tone="neutral">{db.accounts.length} rekening</Pill>}
          />
          {db.accounts.length === 0 ? (
            <EmptyState
              icon="card"
              title="Belum ada rekening tujuan"
              body="Tanpa rekening tujuan, peserta tidak tahu ke mana harus transfer. Tambahkan minimal satu rekening di formulir sebelah."
            />
          ) : (
            <ul className="divide-y divide-dash-line-soft border-t border-dash-line-soft">
              {db.accounts.map((account) => {
                const total = used.get(account.id) ?? 0;
                const isEditing = editing?.id === account.id;
                return (
                  <li
                    key={account.id}
                    className={`flex flex-wrap items-center gap-3 px-[var(--dash-gutter)] py-3.5 ${
                      isEditing ? "bg-dash-bg" : ""
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-dash-soft text-dash-fill-hover">
                      <Icon name="wallet" className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold text-dash-ink">{account.bank}</span>
                        {total > 0 ? (
                          <Pill tone="info">{total} transaksi</Pill>
                        ) : (
                          <Pill tone="neutral">Belum dipakai</Pill>
                        )}
                      </span>
                      <Meta>
                        {account.name} · {account.number}
                      </Meta>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <CopyButton value={account.number} label="Salin no." />
                      <BtnLink
                        href={`/dashboard/pembayaran?edit=${account.id}`}
                        size="sm"
                        icon="pencil"
                        aria-label={`Edit rekening ${account.bank}`}
                      >
                        Edit
                      </BtnLink>
                      <InlineConfirm
                        trigger={
                          <Btn
                            variant="danger"
                            size="sm"
                            icon="trash"
                            aria-label={`Hapus rekening ${account.bank}`}
                          >
                            Hapus
                          </Btn>
                        }
                        confirm={
                          <form action={removeAccountAction}>
                            <input type="hidden" name="id" value={account.id} />
                            <Btn type="submit" variant="danger" size="sm" className="border-dash-off-fg/30">
                              Yakin hapus?
                            </Btn>
                          </form>
                        }
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card padded>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Icon
                name={editing ? "pencil" : "plus"}
                className="h-[18px] w-[18px] text-dash-muted"
              />
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">
                {editing ? "Edit rekening" : "Tambah rekening"}
              </h2>
            </div>
            {editing ? (
              <BtnLink href="/dashboard/pembayaran" size="sm" variant="ghost" icon="x">
                Batal
              </BtnLink>
            ) : null}
          </div>

          <form action={editing ? updateAccountAction : addAccountAction} className="flex flex-col gap-4">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <Field
              id="bank"
              label="Nama bank"
              required
              hint="Contoh: Bank Mandiri, BCA, atau BSI."
              error={empty ? "Wajib diisi." : undefined}
            >
              <input
                id="bank"
                name="bank"
                required
                defaultValue={editing?.bank ?? ""}
                placeholder="Bank Mandiri"
                className={inputClass}
              />
            </Field>
            <Field
              id="name"
              label="Nama rekening"
              required
              hint="Nama pemilik rekening persis seperti di buku tabungan."
              error={empty ? "Wajib diisi." : undefined}
            >
              <input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="PT Bisnis Skill Mastery"
                className={inputClass}
              />
            </Field>
            <Field
              id="number"
              label="Nomor rekening"
              required
              hint="Hanya angka, tanpa spasi atau tanda hubung."
              error={empty ? "Wajib diisi." : undefined}
            >
              <input
                id="number"
                name="number"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={editing?.number ?? ""}
                placeholder="1370099887766"
                className={inputClass}
              />
            </Field>

            <div className="flex items-center gap-2 border-t border-dash-line-soft pt-4">
              <Btn type="submit" variant="primary" icon="check">
                {editing ? "Simpan perubahan" : "Simpan rekening"}
              </Btn>
              {editing ? (
                <BtnLink href="/dashboard/pembayaran" variant="ghost">
                  Batal
                </BtnLink>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
