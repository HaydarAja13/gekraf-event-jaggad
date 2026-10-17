import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listSales } from "@/lib/sales";
import { getSite } from "@/lib/site";
import { planState } from "@/lib/slots";
import type { Site } from "@/lib/types";
import { CheckoutForm } from "./form";
import { BankIcon, CalendarIcon, LockIcon, PinIcon, TicketOffIcon } from "./icons";
import { CheckoutTopbar } from "./topbar";
import { TicketFrame } from "./ticket";

type Plan = Site["pricing"]["plans"][number];

export const metadata: Metadata = {
  title: "Pendaftaran Tiket — Business Skill Mastery",
  description:
    "Langkah terakhir pendaftaran: pilih rekening, transfer sesuai nominal, dan kirim bukti pembayaran.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const site = await getSite();

  return (
    <>
      <CheckoutTopbar navbar={site.navbar} cta={site.cta} />
      <main className="relative flex-1 bg-gekraf-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-gradient-to-b from-[#d9eff7] via-[#e9f4f8] to-transparent"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Head site={site} />
          <Suspense fallback={<TicketFallback site={site} />}>
            <LiveTicket site={site} searchParams={searchParams} />
          </Suspense>
          <p className="mt-10 text-center text-[13px] leading-relaxed text-gekraf-muted">
            {site.navbar.brand} · {site.hero.badge} · Tiket dikirim ke email setelah pembayaran dikonfirmasi.
          </p>
        </div>
      </main>
    </>
  );
}

function Head({ site }: { site: Site }) {
  return (
    <section className="animate-fade-up">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
        <div>
          <p className="text-[13px] font-extrabold tracking-[0.16em] text-gekraf-cyan uppercase">
            Pendaftaran Tiket
          </p>
          <h1 className="mt-2.5 max-w-[15ch] font-serif text-[clamp(2.1rem,3.6vw,2.5rem)] leading-[1.06] font-extrabold tracking-[-0.01em] text-gekraf-ink">
            Satu tiket, satu kursi, satu hari.
          </h1>
        </div>
        <p className="mt-3 text-[14.5px] leading-[1.6] text-gekraf-muted lg:mt-0 lg:max-w-[260px] lg:text-right">
          {site.hero.quota}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 text-[15.5px] sm:flex-row sm:gap-x-8">
        <p className="flex items-start gap-2.5">
          <CalendarIcon size={20} className="mt-0.5 shrink-0 text-gekraf-cyan" />
          <span>
            <span className="block font-extrabold text-gekraf-ink">{site.hero.date}</span>
            <span className="block text-gekraf-muted">{site.hero.time}</span>
          </span>
        </p>
        <p className="flex items-start gap-2.5">
          <PinIcon size={20} className="mt-0.5 shrink-0 text-gekraf-cyan" />
          <span>
            <span className="block font-extrabold text-gekraf-ink">{site.hero.venue}</span>
            <span className="block text-gekraf-muted">{site.hero.city}</span>
          </span>
        </p>
      </div>
    </section>
  );
}

/*
  The pending body keeps the same ticket shell as the live one, so the poster
  never pops in and the perforated silhouette never shifts between states.
*/
function TicketFallback({ site }: { site: Site }) {
  const body = "min-w-0 border-t-2 border-dashed border-[#d3dde2] px-5 py-7 sm:px-7 lg:border-t-0 lg:border-l-2 lg:px-[34px] lg:py-[30px]";
  return (
    <TicketFrame site={site}>
      <section className={body} aria-busy="true">
        <p className="sr-only">Memuat data paket…</p>
        <div className="flex items-center justify-between gap-4">
          <span className="h-8 w-32 animate-pulse rounded-full bg-[#eef2f4]" />
          <span className="h-4 w-40 animate-pulse rounded-full bg-[#f1f4f6]" />
        </div>
        <span className="mt-4 block h-[42px] w-56 animate-pulse rounded-xl bg-[#eef2f4]" />
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <span className="h-4 w-4/5 animate-pulse rounded-full bg-[#f1f4f6]" />
          <span className="h-4 w-3/5 animate-pulse rounded-full bg-[#f1f4f6]" />
          <span className="h-4 w-2/3 animate-pulse rounded-full bg-[#f1f4f6]" />
          <span className="h-4 w-1/2 animate-pulse rounded-full bg-[#f1f4f6]" />
        </div>
        <div className="mt-6 border-t border-[#eef1f3]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`block h-[76px] animate-pulse rounded-xl bg-[#f4f6f8] ${i === 0 ? "sm:col-span-2" : ""}`}
            />
          ))}
        </div>
      </section>
    </TicketFrame>
  );
}

async function LiveTicket({
  site,
  searchParams,
}: {
  site: Site;
  searchParams: Promise<{ plan?: string }>;
}) {
  const query = await searchParams;
  const plans = site.pricing.plans;
  const index = plans.findIndex((item) => item.name === query.plan);
  if (index === -1) notFound();
  const plan = plans[index];
  const db = await listSales();
  const taken: Record<string, number> = {};
  for (const order of db.orders) {
    if (order.status === "rejected") continue;
    taken[order.plan] = (taken[order.plan] ?? 0) + 1;
  }
  const state = planState(plans, taken, index);

  if (db.accounts.length === 0) {
    return (
      <TicketFrame site={site}>
        <Notice
          name={plan.name}
          icon={<BankIcon size={26} />}
          title="Pembayaran belum siap"
          body="Rekening pembayaran belum tersedia, jadi pendaftaran belum bisa diproses dari halaman ini. Hubungi panitia agar Anda dibantu langsung, atau muat ulang halaman ini beberapa saat lagi."
          action={{ href: site.cta.whatsappHref, label: "Hubungi panitia", external: true }}
          whatsappHref={site.cta.whatsappHref}
        />
      </TicketFrame>
    );
  }

  if (state.locked) {
    const target = firstOpen(plans, taken);
    return (
      <TicketFrame site={site}>
        <Notice
          name={plan.name}
          icon={<LockIcon size={26} />}
          title={`Paket ${plan.name} belum dibuka`}
          body="Paket ini terbuka setelah kuota paket sebelumnya terisi penuh. Paket yang sedang dibuka bisa Anda pilih sekarang tanpa kehilangan tempat."
          action={
            target
              ? { href: `/checkout?plan=${encodeURIComponent(target.name)}`, label: `Lanjut ke ${target.name} · ${target.price}` }
              : { href: "/#harga", label: "Lihat semua paket" }
          }
          whatsappHref={site.cta.whatsappHref}
        />
      </TicketFrame>
    );
  }

  if (!state.open) {
    const target = firstOpen(plans, taken);
    return (
      <TicketFrame site={site}>
        <Notice
          name={plan.name}
          icon={<TicketOffIcon size={26} />}
          title={`Kuota ${plan.name} sudah habis`}
          body={
            target
              ? `Paket ${plan.name} sudah penuh terisi. Kabar baiknya, paket ${target.name} sudah dibuka untuk Anda.`
              : `Paket ${plan.name} sudah penuh terisi. Pantau halaman ini untuk paket berikutnya.`
          }
          action={
            target
              ? { href: `/checkout?plan=${encodeURIComponent(target.name)}`, label: `Lanjut ke ${target.name} · ${target.price}` }
              : { href: "/#harga", label: "Lihat semua paket" }
          }
          whatsappHref={site.cta.whatsappHref}
        />
      </TicketFrame>
    );
  }

  return (
    <TicketFrame site={site}>
      <CheckoutForm
        plan={plan}
        left={state.left}
        accounts={db.accounts}
        whatsappHref={site.cta.whatsappHref}
      />
    </TicketFrame>
  );
}

function firstOpen(plans: Plan[], taken: Record<string, number>) {
  for (let i = 0; i < plans.length; i += 1) {
    if (planState(plans, taken, i).open) return plans[i];
  }
  return null;
}

function Notice({
  name,
  icon,
  title,
  body,
  action,
  whatsappHref,
}: {
  name: string;
  icon: ReactNode;
  title: string;
  body: string;
  action?: { href: string; label: string; external?: boolean };
  whatsappHref: string;
}) {
  const cta =
    "mt-6 inline-flex items-center gap-2 rounded-full bg-gekraf-gold px-6 py-3.5 text-[16px] font-extrabold text-gekraf-ink shadow-[0_8px_28px_rgba(242,203,25,0.28)] transition hover:bg-gekraf-gold-bright focus-visible:ring-2 focus-visible:ring-gekraf-ink/40 focus-visible:outline-none";
  return (
    <section className="min-w-0 border-t-2 border-dashed border-[#d3dde2] px-5 py-9 sm:px-7 lg:border-t-0 lg:border-l-2 lg:px-[34px] lg:py-12">
      <span className="inline-flex rounded-full border border-[#cfe9f1] bg-[#e8f6fa] px-3.5 py-1.5 text-[13px] font-extrabold tracking-[0.08em] text-[#016b86]">
        {name}
      </span>
      <div className="mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f6fa] text-gekraf-cyan-deep">
        {icon}
      </div>
      <h2 className="mt-5 text-[24px] leading-tight font-extrabold tracking-tight text-gekraf-ink">{title}</h2>
      <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-gekraf-muted">{body}</p>
      {action ? (
        action.external ? (
          <a href={action.href} target="_blank" rel="noopener noreferrer" className={cta}>
            {action.label}
          </a>
        ) : (
          <Link href={action.href} className={cta}>
            {action.label}
            <span aria-hidden>→</span>
          </Link>
        )
      ) : null}
      {action?.external ? null : (
        <p className="mt-6 text-[13.5px] text-gekraf-muted">
          Pertanyaan cepat?{" "}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gekraf-cyan-deep underline decoration-gekraf-cyan/40 underline-offset-2 transition hover:text-gekraf-cyan"
          >
            Hubungi panitia via WhatsApp
          </a>
          .
        </p>
      )}
    </section>
  );
}
