import { orderByTicket } from "@/lib/sales";
import { getSite } from "@/lib/site";
import { ticketHtml } from "@/lib/ticket";
import { getTicketSettings } from "@/lib/ticket-settings";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const [order, site, ticketSettings] = await Promise.all([
    orderByTicket(code),
    getSite(),
    getTicketSettings(),
  ]);
  if (!order || !order.ticketNo)
    return new Response("Tiket tidak ditemukan.", { status: 404 });

  const html = ticketHtml({
    ticketNo: order.ticketNo,
    name: order.fullName,
    plan: order.plan,
    amount: order.amount,
    when: `${site.hero.date}, ${site.hero.time}`,
    where: `${site.hero.venue}, ${site.hero.city}`,
    eventTitle: ticketSettings.eventTitle,
    eventSubtitle: ticketSettings.eventSubtitle,
    badge: ticketSettings.badge,
    organizer: ticketSettings.organizer,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="tiket-${order.ticketNo}.html"`,
    },
  });
}
