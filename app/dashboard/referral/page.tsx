import { Suspense } from "react";
import { addReferralAction, removeReferralAction, updateReferralAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { formatIdr } from "@/lib/referral";
import { listSales } from "@/lib/sales";
import { CopyButton, InlineConfirm } from "../menu";
import { greeting, todayLine } from "../greeting";
import { Flash } from "@/app/toast";
import {
  Btn,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Field,
  Icon,
  Meta,
  PageHead,
  Pill,
  inputClass,
} from "../ui";

export default function ReferralPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  return (
    <Suspense fallback={<ReferralFallback />}>
      <Referral searchParams={searchParams} />
    </Suspense>
  );
}

function ReferralFallback() {
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

async function Referral({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  const query = await searchParams;
  const [db, admin] = await Promise.all([listSales(), getAdmin()]);
  const editing = db.referrals.find((item) => item.id === query.edit) ?? null;
  const invalid = query.error === "1";

  const used = new Map<string, number>();
  for (const order of db.orders) {
    if (!order.referralCodeId || order.status === "rejected") continue;
    used.set(order.referralCodeId, (used.get(order.referralCodeId) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Kode ini diketik peserta di checkout. Potongannya langsung mengurangi nominal transfer, dan setiap transaksi mencatat apakah kode dipakai."
        actions={
          <BtnLink href="/dashboard/transaksi" icon="receipt">
            Ke transaksi
          </BtnLink>
        }
      />

      <Flash
        items={[
          query.saved === "1" ? { tone: "ok" as const, text: "Kode referral tersimpan." } : null,
          invalid
            ? {
                tone: "off" as const,
                text: "Nama, kode, dan potongan wajib diisi. Kode minimal 2 karakter, huruf atau angka, dan potongan harus lebih dari nol.",
              }
            : null,
          query.error === "taken" ? { tone: "warn" as const, text: "Kode itu sudah dipakai. Gunakan kode yang lain." } : null,
          query.error === "used"
            ? {
                tone: "warn" as const,
                text: "Kode ini sudah tercatat pada transaksi sehingga tidak bisa dihapus. Edit nama atau potongannya kalau ada yang salah.",
              }
            : null,
        ].filter((item) => item !== null)}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card>
          <CardHead
            icon="tag"
            title="Kode referral"
            meta={<Pill tone="neutral">{db.referrals.length} kode</Pill>}
          />
          {db.referrals.length === 0 ? (
            <EmptyState
              icon="tag"
              title="Belum ada kode referral"
              body="Tambahkan kode di formulir sebelah. Peserta yang tidak mengisi kode tetap bisa daftar, dan transaksinya tercatat tanpa potongan."
            />
          ) : (
            <ul className="divide-y divide-dash-line-soft border-t border-dash-line-soft">
              {db.referrals.map((item) => {
                const total = used.get(item.id) ?? 0;
                const isEditing = editing?.id === item.id;
                return (
                  <li
                    key={item.id}
                    className={`flex flex-wrap items-center gap-3 px-[var(--dash-gutter)] py-3.5 ${
                      isEditing ? "bg-dash-bg" : ""
                    }`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-dash-soft text-dash-fill-hover">
                      <Icon name="tag" className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold text-dash-ink">{item.name}</span>
                        {total > 0 ? <Pill tone="info">{total} transaksi</Pill> : <Pill tone="neutral">Belum dipakai</Pill>}
                      </span>
                      <Meta>
                        {item.code} · potongan {formatIdr(item.discountAmount)}
                      </Meta>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <CopyButton value={item.code} label="Salin kode" />
                      <BtnLink
                        href={`/dashboard/referral?edit=${item.id}`}
                        size="sm"
                        icon="pencil"
                        aria-label={`Edit kode ${item.code}`}
                      >
                        Edit
                      </BtnLink>
                      <InlineConfirm
                        trigger={
                          <Btn variant="danger" size="sm" icon="trash" aria-label={`Hapus kode ${item.code}`}>
                            Hapus
                          </Btn>
                        }
                        confirm={
                          <form action={removeReferralAction}>
                            <input type="hidden" name="id" value={item.id} />
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
              <Icon name={editing ? "pencil" : "plus"} className="h-[18px] w-[18px] text-dash-muted" />
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">
                {editing ? "Edit kode referral" : "Tambah kode referral"}
              </h2>
            </div>
            {editing ? (
              <BtnLink href="/dashboard/referral" size="sm" variant="ghost" icon="x">
                Batal
              </BtnLink>
            ) : null}
          </div>

          <form action={editing ? updateReferralAction : addReferralAction} className="flex flex-col gap-4">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <Field
              id="name"
              label="Nama kode referral"
              required
              hint="Nama yang dikenali admin, misalnya komunitas atau pemateri."
              error={invalid ? "Wajib diisi." : undefined}
            >
              <input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="Komunitas Jaggad"
                className={inputClass}
              />
            </Field>
            <Field
              id="code"
              label="Kode referral"
              required
              hint="Huruf dan angka, tanpa spasi. Disimpan sebagai huruf besar."
              error={invalid ? "Minimal 2 karakter, huruf atau angka." : undefined}
            >
              <input
                id="code"
                name="code"
                required
                defaultValue={editing?.code ?? ""}
                placeholder="JAGGAD10"
                autoCapitalize="characters"
                className={`${inputClass} uppercase`}
              />
            </Field>
            <Field
              id="discount"
              label="Potongan nominal"
              required
              hint="Dalam rupiah. 100000 berarti potongan Rp 100.000."
              error={invalid ? "Harus lebih dari nol." : undefined}
            >
              <input
                id="discount"
                name="discount"
                required
                inputMode="numeric"
                defaultValue={editing ? String(editing.discountAmount) : ""}
                placeholder="100000"
                className={inputClass}
              />
            </Field>

            <div className="flex items-center gap-2 border-t border-dash-line-soft pt-4">
              <Btn type="submit" variant="primary" icon="check">
                {editing ? "Simpan perubahan" : "Simpan kode"}
              </Btn>
              {editing ? (
                <BtnLink href="/dashboard/referral" variant="ghost">
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
