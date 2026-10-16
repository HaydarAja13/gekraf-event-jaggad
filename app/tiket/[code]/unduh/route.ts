import { orderByTicket } from "@/lib/sales";
import { getSite } from "@/lib/site";
import { ticketHtml } from "@/lib/ticket";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [order, site] = await Promise.all([orderByTicket(code), getSite()]);
  if (!order || !order.ticketNo) return new Response("Tiket tidak ditemukan.", { status: 404 });
  const html = ticketHtml({
    ticketNo: order.ticketNo,
    name: order.fullName,
    plan: order.plan,
    amount: order.amount,
    when: `${site.hero.date}, ${site.hero.time}`,
    where: `${site.hero.venue}, ${site.hero.city}`,
  });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="tiket-${order.ticketNo}.html"`,
    },
  });
}
