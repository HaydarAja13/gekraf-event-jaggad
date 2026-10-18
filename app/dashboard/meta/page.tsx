import { Suspense } from "react";
import { redirect } from "next/navigation";
import { saveMetaAction, sendMetaTestAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { getMetaSettings } from "@/lib/meta";
import { greeting, todayLine } from "../greeting";
import { Flash } from "@/app/toast";
import { Btn, Card, Field, Icon, PageHead, Pill, inputClass } from "../ui";

export default function MetaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tested?: string; pixel?: string; error?: string; warn?: string }>;
}) {
  return (
    <Suspense fallback={<MetaFallback />}>
      <MetaSettings searchParams={searchParams} />
    </Suspense>
  );
}

function MetaFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-44 rounded-lg bg-dash-line-soft" />
      <div className="h-96 rounded-[14px] border border-dash-line bg-dash-surface" />
    </div>
  );
}

async function MetaSettings({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tested?: string; pixel?: string; error?: string; warn?: string }>;
}) {
  const query = await searchParams;
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  let settings: Awaited<ReturnType<typeof getMetaSettings>> = null;
  let loadError = "";
  try {
    settings = await getMetaSettings();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Pengaturan Meta gagal dimuat.";
  }
  const ready = settings ?? { pixelId: "", testEventCode: "", enabled: true, hasToken: false };
  const pixelName = query.pixel ? decodeURIComponent(query.pixel) : "";

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Sambungkan Pixel dan Conversions API. Iklan Meta lalu menerima kunjungan, pendaftaran, dan pembayaran yang di-ACC."
      />

      <Flash
        items={[
          query.saved === "1"
            ? {
                tone: "ok" as const,
                text: pixelName
                  ? `Terhubung ke pixel ${pixelName}.`
                  : "Pengaturan Meta tersimpan.",
              }
            : null,
          query.tested === "1"
            ? { tone: "ok" as const, text: "Event uji diterima Meta. Lihat di Events Manager, tab Test events." }
            : null,
          query.warn ? { tone: "warn" as const, text: query.warn } : null,
          query.error ? { tone: "off" as const, text: query.error } : null,
          loadError ? { tone: "off" as const, text: loadError } : null,
        ].filter((item) => item !== null)}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card padded>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Icon name="megaphone" className="h-[18px] w-[18px] text-dash-muted" />
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">Meta Ads</h2>
            </div>
            <Pill tone={ready.hasToken && ready.enabled ? "ok" : "wait"}>
              {ready.hasToken && ready.enabled ? "Aktif" : "Belum tersambung"}
            </Pill>
          </div>

          <form action={saveMetaAction} className="flex flex-col gap-4">
            <Field id="pixelId" label="Pixel ID" required hint="Events Manager → Data sources → Settings. Angka 15–16 digit.">
              <input
                id="pixelId"
                name="pixelId"
                required
                inputMode="numeric"
                autoComplete="off"
                defaultValue={ready.pixelId}
                placeholder="123456789012345"
                className={inputClass}
              />
            </Field>
            <Field
              id="accessToken"
              label="Access token Conversions API"
              required={!ready.hasToken}
              hint={
                ready.hasToken
                  ? "Kosongkan kalau token tidak diganti. Token tidak ditampilkan lagi."
                  : "Events Manager → Settings → Conversions API → Generate access token."
              }
            >
              <input
                id="accessToken"
                name="accessToken"
                type="password"
                autoComplete="new-password"
                required={!ready.hasToken}
                className={inputClass}
              />
            </Field>
            <Field
              id="testEventCode"
              label="Kode uji"
              hint="Opsional. Dari tab Test events. Dipakai hanya untuk tombol kirim event uji, tidak masuk iklan."
            >
              <input
                id="testEventCode"
                name="testEventCode"
                autoComplete="off"
                defaultValue={ready.testEventCode}
                placeholder="TEST12345"
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2 text-[13.5px] font-medium text-dash-ink">
              <input
                type="checkbox"
                name="enabled"
                value="1"
                defaultChecked={ready.enabled}
                className="h-4 w-4 accent-dash-fill"
              />
              Pixel dan Conversions API aktif
            </label>
            <div className="border-t border-dash-line-soft pt-4">
              <Btn type="submit" variant="primary" icon="check">
                Simpan dan uji koneksi
              </Btn>
            </div>
          </form>
        </Card>

        <Card padded>
          <div className="mb-3 flex items-center gap-2.5">
            <Icon name="mail" className="h-[18px] w-[18px] text-dash-muted" />
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">Event uji</h2>
          </div>
          <p className="text-[13.5px] leading-relaxed text-dash-muted">
            Simpan dulu, isi kode uji, lalu kirim. Meta menampilkan event ini di tab Test events, bukan di laporan iklan.
          </p>
          <form action={sendMetaTestAction} className="mt-4">
            <Btn type="submit" variant="outline" icon="external">
              Kirim event uji
            </Btn>
          </form>
          <ul className="mt-5 flex flex-col gap-2 border-t border-dash-line-soft pt-4 text-[13px] leading-5 text-dash-muted">
            <li>Kunjungan halaman masuk sebagai PageView lewat Pixel.</li>
            <li>Checkout terbuka masuk sebagai InitiateCheckout.</li>
            <li>Pendaftaran terkirim masuk sebagai Lead, dari browser dan server.</li>
            <li>ACC pembayaran masuk sebagai Purchase dari server.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
