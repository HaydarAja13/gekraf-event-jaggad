import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import { orderByTicket } from "@/lib/sales";
import { getSite } from "@/lib/site";

export default function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-center">Memuat tiket…</p>}>
      <Ticket params={params} />
    </Suspense>
  );
}

async function Ticket({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [order, site] = await Promise.all([orderByTicket(code), getSite()]);
  if (!order) notFound();

  return (
    <>
      <Navbar content={site.navbar} />
      <main className="bg-[#f4fafc] px-4 py-10">
        <article className="mx-auto max-w-md rounded-3xl bg-white p-7">
          <p className="text-[12px] tracking-[0.16em] text-gekraf-muted">BUSINESS SKILL MASTERY</p>
          <p className="mt-5 text-[12px] tracking-[0.14em] text-gekraf-muted">NO. TIKET</p>
          <p className="mt-1 text-[32px] font-extrabold tracking-tight">{order.ticketNo}</p>
          <p className="mt-5 text-[12px] tracking-[0.14em] text-gekraf-muted">NAMA</p>
          <p className="text-[18px] font-bold">{order.fullName}</p>
          <p className="mt-4 text-[12px] tracking-[0.14em] text-gekraf-muted">PAKET</p>
          <p className="text-[18px] font-bold">{order.plan} · {order.amount}</p>
          <p className="mt-4 text-[12px] tracking-[0.14em] text-gekraf-muted">WAKTU</p>
          <p className="text-[18px] font-bold">{site.hero.date}, {site.hero.time}</p>
          <p className="mt-4 text-[12px] tracking-[0.14em] text-gekraf-muted">TEMPAT</p>
          <p className="text-[18px] font-bold">{site.hero.venue}, {site.hero.city}</p>
          <p className="mt-6 text-[15px] leading-relaxed text-gekraf-muted">Tunjukkan tiket ini ke panitia pada hari H.</p>
          <a href={`/tiket/${order.ticketNo}/unduh`} className="mt-6 inline-flex rounded-full bg-gekraf-ink px-5 py-2.5 text-[15px] font-bold text-white">
            Unduh tiket
          </a>
        </article>
      </main>
    </>
  );
}
