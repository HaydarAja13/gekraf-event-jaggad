function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function ticketHtml(input: {
  ticketNo: string;
  name: string;
  plan: string;
  amount: string;
  when: string;
  where: string;
  eventTitle?: string;
  eventSubtitle?: string;
  badge?: string;
  organizer?: string;
}) {
  const ticketNo = esc(input.ticketNo);
  const name = esc(input.name);
  const plan = esc(input.plan);
  const amount = esc(input.amount);
  const when = esc(input.when);
  const where = esc(input.where);
  const eventTitle = esc(input.eventTitle || "BUSINESS SKILL MASTERY");
  const eventSubtitle = esc(
    input.eventSubtitle || "Solusi In This Economy · Exclusive Masterclass",
  );
  const badge = esc(input.badge || "E-TIKET RESMI · VIP PASS");
  const organizer = esc(
    input.organizer || "DPD GEKRAF Jawa Tengah × Jaggad Academy",
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticketNo)}&margin=4&color=0b1118&bgcolor=0299c3`;

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tiket ${ticketNo} — ${eventTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #edf2f7;
      color: #0b0e16;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 32px 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .ticket-card {
      width: 100%;
      max-width: 540px;
      background: #0b131c;
      border: 2px solid #F2CB19;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
    }
    .ticket-header {
      background: linear-gradient(135deg, #013847 0%, #017a99 100%);
      padding: 24px 28px;
      text-align: center;
      border-bottom: 3px solid #F2CB19;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(242,203,25,0.2);
      border: 1px solid #F2CB19;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #F2CB19;
      text-transform: uppercase;
    }
    .title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 900;
      margin-top: 10px;
      letter-spacing: -0.01em;
    }
    .subtitle {
      color: #93d8e9;
      font-size: 13px;
      margin-top: 4px;
      font-weight: 600;
    }
    .ticket-body {
      padding: 26px 28px;
      background: #0b131c;
    }
    .ticket-no-box {
      background: #070d13;
      border: 1px solid #F2CB19;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
    }
    .no-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #F2CB19;
      text-transform: uppercase;
    }
    .no-value {
      font-family: monospace;
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.08em;
      margin-top: 4px;
    }
    .grid-info {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      border-bottom: 1px dashed #223749;
      padding-bottom: 22px;
      margin-bottom: 20px;
    }
    .info-group {
      margin-bottom: 14px;
    }
    .info-group:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: #7e93a6;
      text-transform: uppercase;
    }
    .info-val {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 3px;
      line-height: 1.35;
    }
    .qr-box {
      background: #0299c3;
      border-radius: 12px;
      padding: 8px;
      border: 2px solid #F2CB19;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .qr-box img {
      width: 130px;
      height: 130px;
      display: block;
    }
    .qr-caption {
      font-size: 9px;
      font-weight: 800;
      color: #0b131c;
      letter-spacing: 0.04em;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .instructions {
      background: #101c27;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .instructions strong {
      color: #e2e8f0;
    }
    .ticket-footer {
      background: #070c12;
      padding: 16px 24px;
      text-align: center;
      border-top: 1px solid #1a2734;
      font-size: 12px;
      color: #64748b;
    }
    .ticket-footer strong {
      color: #cbd5e1;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .ticket-card { box-shadow: none; max-width: 100%; border-color: #000; }
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="ticket-header">
      <span class="badge">✦ ${badge} ✦</span>
      <h1 class="title">${eventTitle}</h1>
      <p class="subtitle">${eventSubtitle}</p>
    </div>
    <div class="ticket-body">
      <div class="ticket-no-box">
        <div>
          <div class="no-label">Nomor Tiket Resmi</div>
          <div class="no-value">${ticketNo}</div>
        </div>
        <div style="text-align:right">
          <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:#10b981;color:#ffffff;font-size:11px;font-weight:800;">
            ✓ TERKONFIRMASI
          </span>
        </div>
      </div>

      <div class="grid-info">
        <div>
          <div class="info-group">
            <div class="info-label">Nama Peserta</div>
            <div class="info-val">${name}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Paket Tiket</div>
            <div class="info-val" style="color:#38bdf8;">${plan} · ${amount}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Waktu & Tanggal</div>
            <div class="info-val">${when}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Lokasi Acara</div>
            <div class="info-val">${where}</div>
          </div>
        </div>
        <div>
          <div class="qr-box">
            <img src="${qrUrl}" alt="QR Code ${ticketNo}">
            <div class="qr-caption">Official Pass</div>
          </div>
        </div>
      </div>

      <div class="instructions">
        <strong>Ketentuan Masuk:</strong> Tunjukkan e-tiket atau cetakan ini beserta KTP/tanda pengenal asli kepada panitia saat registrasi di lokasi.
      </div>
    </div>
    <div class="ticket-footer">
      <strong>${organizer}</strong> · Simpan tiket ini dengan baik.
    </div>
  </div>
</body>
</html>`;
}
