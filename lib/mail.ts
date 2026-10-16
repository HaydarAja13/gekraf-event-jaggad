import nodemailer from "nodemailer";
import type { Order } from "@/lib/sales";

export async function sendTicketEmail(input: {
  order: Order;
  ticketNo: string;
  pageUrl: string;
  downloadUrl: string;
  when: string;
  where: string;
}) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass || !from) {
    return {
      ok: false as const,
      error:
        "SMTP belum diisi. Tambahkan SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, dan SMTP_FROM di .env.local, lalu ACC lagi.",
    };
  }

  const { order, ticketNo, pageUrl, downloadUrl, when, where } = input;
  const html = `<div style="color:#111;max-width:520px">
    <p>Halo ${escapeHtml(order.fullName)},</p>
    <p>Pembayaran paket <strong>${escapeHtml(order.plan)}</strong> sudah dikonfirmasi. Ini tiket acara Anda. Tunjukkan tiket ini ke panitia pada hari H.</p>
    <div style="border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin:16px 0">
      <p style="margin:0;letter-spacing:.14em;font-size:12px;color:#6b7280">NO. TIKET</p>
      <p style="margin:6px 0 0;font-size:28px;font-weight:800">${escapeHtml(ticketNo)}</p>
      <p style="margin:16px 0 0"><strong>${escapeHtml(order.fullName)}</strong><br>${escapeHtml(order.plan)} · ${escapeHtml(order.amount)}</p>
      <p style="margin:8px 0 0">${escapeHtml(when)}<br>${escapeHtml(where)}</p>
    </div>
    <p><a href="${pageUrl}">Buka tiket</a> · <a href="${downloadUrl}">Unduh tiket</a></p>
  </div>`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from,
      to: order.email,
      subject: `Tiket ${ticketNo} — Business Skill Mastery`,
      html,
    });
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMTP gagal";
    return { ok: false as const, error: `Email tiket gagal terkirim: ${message}` };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
