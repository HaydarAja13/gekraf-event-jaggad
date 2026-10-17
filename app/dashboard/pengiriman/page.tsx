import { Suspense } from "react";
import { redirect } from "next/navigation";
import { saveSmtpAction, sendCustomTicketAction, sendSmtpProbeAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { listSales } from "@/lib/sales";
import { getSmtpSettings } from "@/lib/smtp";
import { getSite } from "@/lib/site";
import { greeting, todayLine } from "../greeting";
import { Btn, Card, Field, Icon, Notice, PageHead, Pill, inputClass } from "../ui";

const SUMOPOD = { host: "smtp.sumopod.com", port: 465, secure: true };

export default function PengirimanPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; sent?: string; probe?: string; error?: string; warn?: string }>;
}) {
  return (
    <Suspense fallback={<PengirimanFallback />}>
      <Pengiriman searchParams={searchParams} />
    </Suspense>
  );
}

function PengirimanFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-44 rounded-lg bg-dash-line-soft" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 rounded-[14px] border border-dash-line bg-dash-surface" />
        <div className="h-96 rounded-[14px] border border-dash-line bg-dash-surface" />
      </div>
    </div>
  );
}

async function Pengiriman({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; sent?: string; probe?: string; error?: string; warn?: string }>;
}) {
  const query = await searchParams;
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const [sales, smtp, site] = await Promise.all([listSales(), getSmtpSettings(), getSite()]);
  const settings = smtp ?? { ...SUMOPOD, username: "", fromName: "", fromEmail: "", hasPassword: false };
  const tickets = sales.orders.filter((order) => order.status === "approved" && order.ticketNo);

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Tiket terkirim otomatis ke email peserta begitu pembayaran di-ACC. Isi SMTP Sumopod di sini."
      />

      {query.saved === "1" ? <Notice tone="ok">Pengaturan SMTP tersimpan dan koneksi berhasil.</Notice> : null}
      {query.sent === "1" ? <Notice tone="ok">Tiket terkirim ke email yang diminta.</Notice> : null}
      {query.probe === "1" ? (
        <Notice tone="ok">Email tiket terkirim. Isi dan tampilannya sama dengan email peserta.</Notice>
      ) : null}
      {query.warn ? <Notice tone="warn">{query.warn}</Notice> : null}
      {query.error ? <Notice tone="off">{query.error}</Notice> : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card padded>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Icon name="settings" className="h-[18px] w-[18px] text-dash-muted" />
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">SMTP</h2>
            </div>
            <Pill tone={settings.hasPassword ? "ok" : "wait"}>{settings.hasPassword ? "Siap" : "Belum diisi"}</Pill>
          </div>

          <form action={saveSmtpAction} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="host" label="Host" required hint="Sumopod memakai smtp.sumopod.com.">
                <input id="host" name="host" required defaultValue={settings.host} className={inputClass} />
              </Field>
              <Field id="port" label="Port" required hint="465 untuk SSL.">
                <input
                  id="port"
                  name="port"
                  type="number"
                  required
                  min={1}
                  max={65535}
                  defaultValue={settings.port}
                  className={inputClass}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-[13.5px] font-medium text-dash-ink">
              <input
                type="checkbox"
                name="secure"
                value="1"
                defaultChecked={settings.secure}
                className="h-4 w-4 accent-dash-fill"
              />
              SSL aktif
            </label>

            <Field id="username" label="Username" required>
              <input
                id="username"
                name="username"
                required
                autoComplete="off"
                defaultValue={settings.username}
                className={inputClass}
              />
            </Field>
            <Field
              id="password"
              label="Password"
              required={!settings.hasPassword}
              hint={settings.hasPassword ? "Kosongkan kalau password tidak diganti." : "Password akun SMTP."}
            >
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required={!settings.hasPassword}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fromName" label="Nama pengirim" required hint='Contoh: Panitia BSM.'>
                <input
                  id="fromName"
                  name="fromName"
                  required
                  defaultValue={settings.fromName}
                  placeholder="Panitia BSM"
                  className={inputClass}
                />
              </Field>
              <Field
                id="fromEmail"
                label="Email pengirim"
                required
                hint="Alamat yang diminta ke Sumopod. Sebelum domain Anda diverifikasi di Sumopod, Gmail menampilkan @sumosender.com."
              >
                <input
                  id="fromEmail"
                  name="fromEmail"
                  type="email"
                  required
                  defaultValue={settings.fromEmail}
                  placeholder="tiket@example.com"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="border-t border-dash-line-soft pt-4">
              <Btn type="submit" variant="primary" icon="check">
                Simpan dan uji koneksi
              </Btn>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-4">
          <Card padded>
            <div className="mb-4 flex items-center gap-2.5">
              <Icon name="mail" className="h-[18px] w-[18px] text-dash-muted" />
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">Kirim tiket</h2>
            </div>
            {tickets.length === 0 ? (
              <p className="text-[13.5px] leading-relaxed text-dash-muted">
                Belum ada tiket yang di-ACC. Setelah ada, tiket itu bisa dikirim ulang ke email mana pun.
              </p>
            ) : (
              <form action={sendCustomTicketAction} className="flex flex-col gap-4">
                <Field id="orderId" label="Tiket" required hint="Isi tiket tetap milik peserta yang dipilih.">
                  <select id="orderId" name="orderId" required defaultValue="" className={inputClass}>
                    <option value="" disabled>
                      Pilih tiket
                    </option>
                    {tickets.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.ticketNo} — {order.fullName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="ticketTo" label="Email penerima" required hint="Boleh berbeda dari email peserta.">
                  <input
                    id="ticketTo"
                    name="to"
                    type="email"
                    required
                    placeholder="nama@perusahaan.co.id"
                    className={inputClass}
                  />
                </Field>
                <Btn type="submit" variant="primary" icon="mail">
                  Kirim tiket
                </Btn>
              </form>
            )}
          </Card>

          <Card padded>
            <div className="mb-4 flex items-center gap-2.5">
              <Icon name="mail" className="h-[18px] w-[18px] text-dash-muted" />
              <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink">Coba email tiket</h2>
            </div>
            <form action={sendSmtpProbeAction} className="flex flex-col gap-4">
              <Field
                id="probeName"
                label="Nama di tiket"
                required
                hint="Isi email ini sama dengan yang dikirim setelah pembayaran di-ACC. Nomor tiket percobaan tidak disimpan, jadi tautan tiketnya belum bisa dibuka."
              >
                <input id="probeName" name="fullName" required placeholder="Nama lengkap" className={inputClass} />
              </Field>
              <Field id="probePlan" label="Paket" required>
                <select id="probePlan" name="plan" required className={inputClass} defaultValue={site.pricing.plans[0]?.name ?? ""}>
                  {site.pricing.plans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} · {plan.price}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="probeTo" label="Kirim ke" required>
                <input
                  id="probeTo"
                  name="to"
                  type="email"
                  required
                  placeholder="nama@perusahaan.co.id"
                  className={inputClass}
                />
              </Field>
              <Btn type="submit" variant="primary" icon="mail">
                Kirim email tiket
              </Btn>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
