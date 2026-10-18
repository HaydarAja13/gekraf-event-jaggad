import type { MailAttachment } from "@/lib/smtp";

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
  pamphletUrl?: string;
  subtitle?: string;
  greeting?: string;
  instructions?: string[];
  supportWhatsapp?: string;
  supportLabel?: string;
  organizer?: string;
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
  const subtitle = escapeHtml(
    input.subtitle || "Solusi In This Economy · Exclusive Masterclass",
  );
  const rawGreeting =
    input.greeting ||
    "Halo {name}, pembayaran paket {plan} telah kami terima dan terkonfirmasi. Simpan e-tiket resmi ini dan tunjukkan kepada panitia pada hari acara.";
  const greetingText = escapeHtml(
    rawGreeting
      .replaceAll("{name}", input.fullName)
      .replaceAll("{plan}", input.plan)
      .replaceAll("{ticketNo}", input.ticketNo),
  );
  const supportWhatsapp = escapeHtml(
    input.supportWhatsapp?.replace(/[^0-9]/g, "") || "6282221768800",
  );
  const supportLabel = escapeHtml(
    input.supportLabel || "Hubungi Panitia via WhatsApp",
  );
  const organizer = escapeHtml(
    input.organizer || "DPD GEKRAF Jawa Tengah × Jaggad Academy",
  );

  const instructions =
    input.instructions && input.instructions.length > 0
      ? input.instructions
      : [
          "Tunjukkan QR Code atau Nomor Tiket pada email ini ke meja registrasi di lokasi acara.",
          "Wajib membawa kartu identitas diri (KTP / SIM / Paspor) yang sah sesuai nama peserta.",
          "Pintu registrasi dibuka mulai pukul 07.00 WIB. Disarankan hadir 30 menit lebih awal untuk kelancaran registrasi.",
          "E-tiket ini bersifat unik dan hanya berlaku untuk 1 (satu) kali penukaran wristband / ID Card resmi.",
        ];

  // Dynamic QR Code image service (renders crisp PNG in Gmail, Outlook, Apple Mail)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&data=${encodeURIComponent(input.pageUrl)}&margin=6&color=0b1118&bgcolor=ffffff`;

  const instructionRows = instructions
    .map(
      (item, idx) => `
      <tr>
        <td valign="top" style="padding: 10px 14px 10px 0; width: 30px;">
          <div style="background-color:#0299c3; color:#ffffff; border-radius:50%; width:26px; height:26px; line-height:26px; text-align:center; font-size:12px; font-weight:800; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; box-shadow:0 2px 6px rgba(2,153,195,0.3);">
            ${idx + 1}
          </div>
        </td>
        <td valign="middle" style="padding: 10px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
          ${escapeHtml(item)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tiket ${ticketNo} — ${event}</title>
  <style type="text/css">
    @media only screen and (max-width: 540px) {
      .email-wrap { padding: 12px 6px 28px !important; }
      .email-card { border-radius: 16px !important; }
      .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .email-header-pad { padding: 26px 16px 22px !important; }
      .email-btn-tbl { width: 100% !important; }
      .email-btn-tbl td { display: block !important; width: 100% !important; padding: 0 !important; }
      .email-btn-tbl td + td { margin-top: 10px !important; }
      .email-btn-tbl a { display: block !important; text-align: center !important; width: 100% !important; box-sizing: border-box !important; }
      .email-wa-text { display: block !important; width: 100% !important; padding-right: 0 !important; text-align: left !important; margin-bottom: 12px !important; }
      .email-wa-btn { display: block !important; width: 100% !important; text-align: center !important; }
      .email-wa-btn a { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, h1, h2 { font-family: sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#edf2f7; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; color:#0b0e16;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all; font-size:1px; line-height:1px;">
    Tiket Resmi ${ticketNo} untuk ${event} — ${name}. Tunjukkan QR Code ini kepada panitia saat registrasi.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#edf2f7; width:100%;">
    <tr>
      <td align="center" class="email-wrap" style="padding:32px 14px 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-card" style="max-width:600px; width:100%; margin:0 auto; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 14px 44px rgba(1,42,56,0.16); border:1px solid #d4dfe7; border-collapse:separate;">
          
          <!-- TOP HEADER BANNER: Gekraf Midnight & Gold -->
          <tr>
            <td class="email-header-pad" style="background: linear-gradient(135deg, #061118 0%, #013847 60%, #017a99 100%); padding:36px 32px 28px; text-align:center; border-bottom:3px solid #F2CB19;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="display:inline-block; padding:5px 16px; border-radius:999px; background:rgba(242,203,25,0.18); border:1px solid rgba(242,203,25,0.45); font-size:11px; font-weight:800; letter-spacing:0.14em; color:#F2CB19; text-transform:uppercase;">
                      ✦ ${badge} ✦
                    </span>
                    <h1 style="margin:16px 0 6px; font-size:26px; line-height:1.25; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                      ${event}
                    </h1>
                    <p style="margin:0; font-size:14px; font-weight:600; color:#93d8e9; letter-spacing:0.02em;">
                      ${subtitle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- OFFICIAL SPEAKERS STRIP (the poster itself stays a plain attachment) -->
          <tr>
            <td class="email-pad" style="padding:26px 30px 0; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#091924; border-radius:16px; border:1px solid #0299c3; box-shadow:0 8px 24px rgba(2,153,195,0.18); border-collapse:separate;">
                <tr>
                  <td align="center" style="padding:15px 20px;">
                    <p style="margin:0; font-size:12px; font-weight:700; color:#F2CB19; letter-spacing:0.08em; text-transform:uppercase; line-height:1.5;">
                      ★ PEMATERI RESMI: SANDIAGA UNO · BAYU SETYA BUDI · DERYANSHA AZHARY ★
                    </p>
                    <p style="margin:7px 0 0; font-size:11.5px; font-weight:600; color:#93d8e9; line-height:1.5;">
                      Pamflet resmi acara tersedia pada lampiran email ini.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GREETING & CONFIRMATION NOTICE WITH EXCELLENT PADDING -->
          <tr>
            <td class="email-pad" style="padding:16px 30px 22px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                <tr>
                  <td style="padding:22px 26px; background-color:#f0f8fb; border:1px solid #cbe6f0; border-radius:16px;">
                    <p style="margin:0 0 8px; font-size:11px; font-weight:800; letter-spacing:0.12em; color:#017a99; text-transform:uppercase;">
                      STATUS KONFIRMASI
                    </p>
                    <p style="margin:0; font-size:15px; line-height:1.75; color:#1e293b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                      ${greetingText}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PHYSICAL PASS / VIP CREDENTIAL CARD -->
          <tr>
            <td class="email-pad" style="padding:10px 30px 26px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b131c; border-radius:20px; overflow:hidden; border:2px solid #F2CB19; box-shadow:0 10px 30px rgba(0,0,0,0.25); border-collapse:separate;">
                
                <!-- CARD HEADER STRIP -->
                <tr>
                  <td style="background: linear-gradient(90deg, #014354 0%, #0299c3 100%); padding:14px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left" style="font-size:11px; font-weight:800; letter-spacing:0.12em; color:#ffffff; text-transform:uppercase;">
                          OFFICIAL ATTENDEE CREDENTIAL
                        </td>
                        <td align="right">
                          <span style="display:inline-block; background:#10b981; color:#ffffff; font-size:10.5px; font-weight:800; letter-spacing:0.06em; padding:4px 10px; border-radius:999px;">
                            ✓ TERKONFIRMASI
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- TICKET NUMBER BAR -->
                <tr>
                  <td style="padding:22px 24px 18px; border-bottom:1px dashed #223749;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; color:#F2CB19; text-transform:uppercase;">
                            NO. TIKET RESMI
                          </p>
                          <p style="margin:6px 0 0; font-family:'Courier New', Courier, monospace; font-size:30px; line-height:1.1; font-weight:900; letter-spacing:0.08em; color:#ffffff;">
                            ${ticketNo}
                          </p>
                        </td>
                        <td align="right" valign="middle">
                          <span style="display:inline-block; border:1px solid #F2CB19; color:#F2CB19; font-size:12px; font-weight:800; padding:6px 14px; border-radius:8px; background:rgba(242,203,25,0.08);">
                            ${plan}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- SCANNABLE QR ON TOP, ATTENDEE INFO BELOW -->
                <tr>
                  <td style="padding:24px 24px 26px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:22px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:14px; border:2px solid #F2CB19;">
                            <tr>
                              <td align="center" style="padding:10px;">
                                <img src="${qrCodeUrl}" alt="QR Code Tiket ${ticketNo}" width="200" height="200" style="display:block; width:200px; height:200px; border-radius:8px;" />
                              </td>
                            </tr>
                          </table>
                          <p style="margin:12px 0 0; font-size:10.5px; font-weight:800; color:#F2CB19; letter-spacing:0.06em; text-align:center; line-height:1.4;">
                            SCAN UNTUK CHECK-IN / REGISTRASI
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top:1px dashed #223749; padding-top:20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" style="padding-bottom:16px;">
                                <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:0.14em; color:#7e93a6; text-transform:uppercase;">NAMA PESERTA</p>
                                <p style="margin:4px 0 0; font-size:18px; font-weight:800; color:#ffffff; line-height:1.35;">${name}</p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding-bottom:16px;">
                                <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:0.14em; color:#7e93a6; text-transform:uppercase;">TOTAL BIAYA</p>
                                <p style="margin:4px 0 0; font-size:15px; font-weight:700; color:#38bdf8;">${amount}</p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding-bottom:16px;">
                                <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:0.14em; color:#7e93a6; text-transform:uppercase;">WAKTU &amp; TANGGAL</p>
                                <p style="margin:4px 0 0; font-size:14px; font-weight:700; color:#e2e8f0; line-height:1.45;">${when}</p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:0.14em; color:#7e93a6; text-transform:uppercase;">LOKASI VENUE</p>
                                <p style="margin:4px 0 0; font-size:14px; font-weight:700; color:#e2e8f0; line-height:1.45;">${where}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CALL TO ACTION BUTTONS -->
                <tr>
                  <td style="background-color:#070d13; padding:20px 24px; border-top:1px solid #162432;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-btn-tbl">
                            <tr>
                              <td align="center" style="border-radius:999px; background:linear-gradient(135deg, #0299c3 0%, #017a99 100%); box-shadow:0 4px 14px rgba(2,153,195,0.4);">
                                <a href="${pageUrl}" target="_blank" style="display:inline-block; padding:13px 28px; font-size:14px; font-weight:800; color:#ffffff; text-decoration:none; letter-spacing:0.02em;">
                                  Buka tiket digital &rarr;
                                </a>
                              </td>
                              <td width="12"></td>
                              <td align="center" style="border-radius:999px; border:1px solid #334d61; background:#0e1b27;">
                                <a href="${downloadUrl}" target="_blank" style="display:inline-block; padding:12px 22px; font-size:13px; font-weight:700; color:#e2e8f0; text-decoration:none;">
                                  Unduh Tiket
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CHECKLIST & ENTRY INSTRUCTIONS WITH GENEROUS INNER PADDING -->
          <tr>
            <td class="email-pad" style="padding:6px 30px 24px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; border-radius:18px; border:1px solid #e2e8f0; border-collapse:separate;">
                <tr>
                  <td style="padding:22px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:14px; font-size:12.5px; font-weight:800; letter-spacing:0.1em; color:#0f172a; text-transform:uppercase; border-bottom:1px solid #e2e8f0;">
                          📋 PANDUAN KEHADIRAN &amp; REGISTRASI
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${instructionRows}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WHATSAPP HELPDESK BANNER WITH GENEROUS INNER PADDING -->
          <tr>
            <td class="email-pad" style="padding:0 30px 28px; background-color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                <tr>
                  <td style="padding:20px 24px; background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" class="email-wa-text" style="padding-right:16px;">
                          <p style="margin:0; font-size:14px; font-weight:800; color:#065f46; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                            Butuh bantuan atau informasi jadwal?
                          </p>
                          <p style="margin:4px 0 0; font-size:12.5px; line-height:1.5; color:#047857; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                            Tim panitia siap membantu konfirmasi kehadiran Anda via WhatsApp.
                          </p>
                        </td>
                        <td align="right" valign="middle" class="email-wa-btn" style="white-space:nowrap;">
                          <a href="https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(`Halo Panitia ${event}, saya peserta atas nama ${input.fullName} (No. Tiket: ${input.ticketNo}) ingin menanyakan terkait acara.`)}" target="_blank" style="display:inline-block; padding:11px 20px; border-radius:10px; background:#10b981; color:#ffffff; font-size:12.5px; font-weight:800; text-decoration:none; box-shadow:0 2px 8px rgba(16,185,129,0.3); font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                            ${supportLabel} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER & LEGAL NOTICE -->
          <tr>
            <td class="email-pad" style="background-color:#0b1118; padding:28px 30px; text-align:center; border-top:1px solid #1a2734;">
              <p style="margin:0; font-size:13.5px; font-weight:700; color:#ffffff; letter-spacing:0.04em;">
                ${organizer}
              </p>
              <p style="margin:8px 0 0; font-size:12px; line-height:1.5; color:#788896;">
                ${when} · ${where}
              </p>
              <p style="margin:16px 0 0; font-size:11px; line-height:1.6; color:#4e5e6e;">
                Email ini merupakan tiket sah & tanda kepemilikan resmi yang diterbitkan secara elektronik.<br>
                Harap tidak membagikan nomor tiket atau QR code Anda kepada pihak lain.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `=== ${event} ===`,
    subtitle,
    badge,
    "",
    `Halo ${input.fullName},`,
    "",
    `Pembayaran paket ${input.plan} sebesar ${input.amount} telah kami terima dan terkonfirmasi.`,
    "Berikut adalah rincian e-tiket resmi Anda:",
    "",
    `Nomor tiket: ${input.ticketNo}`,
    `Nama: ${input.fullName}`,
    `Paket: ${input.plan} · ${input.amount}`,
    `Waktu: ${input.when}`,
    `Tempat: ${input.where}`,
    "",
    `BUKA TIKET DIGITAL : ${input.pageUrl}`,
    `UNDUH TIKET FILE   : ${input.downloadUrl}`,
    "Pamflet acara      : terlampir pada email ini",
    "",
    "PANDUAN KEHADIRAN:",
    ...instructions.map((item, idx) => `${idx + 1}. ${item}`),
    "",
    `Bantuan Panitia WhatsApp: https://wa.me/${supportWhatsapp}`,
    `Penyelenggara: ${organizer}`,
  ].join("\n");

  return {
    subject: `Tiket ${input.ticketNo} — ${input.event}`,
    text,
    html,
  };
}

export async function ticketMailPayload(input: TicketMail) {
  const path = await import("node:path");
  const fs = await import("node:fs");

  // The pamphlet rides along as a regular attachment (never embedded in the HTML),
  // so Gmail lists it as a file instead of rendering a broken inline image.
  // The QR itself is a plain remote image (see ticketMessage), so it never shows up
  // in the attachment list either.
  const attachments: MailAttachment[] = [];

  const rawPamphlet = input.pamphletUrl || "/pamflet.jpeg";
  let relativePath = "";
  if (/^https?:\/\//i.test(rawPamphlet)) {
    try {
      const parsed = new URL(rawPamphlet);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        relativePath = parsed.pathname;
      }
    } catch {
      // ignore
    }
  } else {
    relativePath = rawPamphlet;
  }

  if (relativePath) {
    const cleanPath = relativePath.split("?")[0].replace(/^\//, "");
    const localFile = path.join(process.cwd(), "public", cleanPath);
    if (fs.existsSync(localFile)) {
      attachments.push({
        filename: path.basename(localFile),
        path: localFile,
      });
    }
  }

  return { ...ticketMessage(input), attachments };
}

export async function sendTicketEmail(input: TicketMail) {
  const { deliverMail } = await import("@/lib/smtp");
  const payload = await ticketMailPayload(input);

  const sent = await deliverMail({
    to: input.to.trim(),
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    attachments: payload.attachments,
  });
  if (sent.ok || sent.error.startsWith("SMTP belum diatur")) return sent;
  return {
    ok: false as const,
    error: `Email tiket gagal terkirim: ${sent.error}`,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
