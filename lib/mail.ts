export type TicketMail = {
  fullName: string;
  plan: string;
  amount: string;
  ticketNo: string;
  pageUrl: string;
  downloadUrl: string;
  when: string;
  where: string;
  event: string;
  badge: string;
  to: string;
};

export function ticketMessage(input: TicketMail) {
  const name = escapeHtml(input.fullName);
  const plan = escapeHtml(input.plan);
  const amount = escapeHtml(input.amount);
  const ticketNo = escapeHtml(input.ticketNo);
  const when = escapeHtml(input.when);
  const where = escapeHtml(input.where);
  const event = escapeHtml(input.event);
  const badge = escapeHtml(input.badge);
  const pageUrl = escapeHtml(input.pageUrl);
  const downloadUrl = escapeHtml(input.downloadUrl);
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:11px 0;border-top:1px solid #e6e8ee;font-size:12px;letter-spacing:.08em;color:#686866;width:92px;vertical-align:top;">${label}</td>
      <td style="padding:11px 0;border-top:1px solid #e6e8ee;font-size:15px;line-height:1.4;font-weight:700;color:#0b0e16;">${value}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f1f5;color:#0b0e16;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Pembayaran paket ${plan} sudah dikonfirmasi. Simpan email ini sebagai tiket ${event}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f1f5;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:#0b0e16;padding:26px 28px 22px;">
              <p style="margin:0;font-size:12px;letter-spacing:.16em;color:#f2cb19;">TIKET TERKONFIRMASI</p>
              <p style="margin:10px 0 0;font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;">${event}</p>
              <p style="margin:6px 0 0;font-size:14px;line-height:1.4;color:#c5cdd8;">${badge}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:16px;line-height:1.5;color:#0b0e16;">Halo ${name},</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#3a3d46;">Pembayaran paket <strong style="color:#0b0e16;">${plan}</strong> sebesar <strong style="color:#0b0e16;">${amount}</strong> sudah kami terima. Berikut tiket acara Anda. Simpan email ini, lalu tunjukkan nomor tiket kepada panitia pada hari acara.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0e16;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px 16px;">
                    <p style="margin:0;font-size:11px;letter-spacing:.14em;color:#f2cb19;">NOMOR TIKET</p>
                    <p style="margin:6px 0 0;font-size:28px;line-height:1.1;font-weight:700;letter-spacing:.04em;color:#ffffff;">${ticketNo}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("NAMA", name)}
                ${row("PAKET", `${plan} · ${amount}`)}
                ${row("WAKTU", when)}
                ${row("TEMPAT", where)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:999px;background:#0299c3;">
                    <a href="${pageUrl}" style="display:inline-block;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Buka tiket</a>
                  </td>
                  <td width="10"></td>
                  <td style="border-radius:999px;border:1px solid #c9ced8;">
                    <a href="${downloadUrl}" style="display:inline-block;padding:11px 16px;font-size:14px;font-weight:700;color:#0b0e16;text-decoration:none;">Unduh tiket</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#686866;">Datang sesuai jadwal. Bawa identitas diri. Nomor tiket di atas cukup ditunjukkan dari email ini atau dari halaman tiket.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 20px;background:#f7f8fa;">
              <p style="margin:0;font-size:13px;line-height:1.5;font-weight:700;color:#0b0e16;">${event}</p>
              <p style="margin:4px 0 0;font-size:12px;line-height:1.5;color:#686866;">${when}<br>${where}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    input.event,
    input.badge,
    "",
    `Halo ${input.fullName},`,
    "",
    `Pembayaran paket ${input.plan} sebesar ${input.amount} sudah kami terima.`,
    "Berikut tiket acara Anda. Simpan email ini, lalu tunjukkan nomor tiket kepada panitia pada hari acara.",
    "",
    `Nomor tiket: ${input.ticketNo}`,
    `Nama: ${input.fullName}`,
    `Paket: ${input.plan} · ${input.amount}`,
    `Waktu: ${input.when}`,
    `Tempat: ${input.where}`,
    "",
    `Buka tiket: ${input.pageUrl}`,
    `Unduh tiket: ${input.downloadUrl}`,
    "",
    "Datang sesuai jadwal. Bawa identitas diri.",
  ].join("\n");

  return {
    subject: `Tiket ${input.ticketNo} — ${input.event}`,
    text,
    html,
  };
}

export async function sendTicketEmail(input: TicketMail) {
  const { deliverMail } = await import("@/lib/smtp");
  const message = ticketMessage(input);
  const sent = await deliverMail({ to: input.to.trim(), ...message });
  if (sent.ok || sent.error.startsWith("SMTP belum diatur")) return sent;
  return { ok: false as const, error: `Email tiket gagal terkirim: ${sent.error}` };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
