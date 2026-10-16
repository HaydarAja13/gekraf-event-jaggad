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
}) {
  const ticketNo = esc(input.ticketNo);
  const row = (label: string, value: string) =>
    `<p style="margin:14px 0 0;font-size:12px;letter-spacing:.12em;color:#6b7280">${label}</p><p style="margin:4px 0 0;font-size:18px;font-weight:700">${esc(value)}</p>`;
  return `<!doctype html><html lang="id"><meta charset="utf-8"><title>Tiket ${ticketNo}</title>
<body style="margin:0;background:#f4f5f8;color:#111">
<main style="max-width:460px;margin:32px auto;background:#fff;border-radius:20px;padding:28px">
<p style="margin:0;font-size:13px;letter-spacing:.16em;color:#6b7280">BUSINESS SKILL MASTERY</p>
<p style="margin:18px 0 0;font-size:12px;letter-spacing:.14em;color:#6b7280">NO. TIKET</p>
<p style="margin:4px 0 0;font-size:32px;font-weight:800">${ticketNo}</p>
${row("NAMA", input.name)}
${row("PAKET", `${input.plan} · ${input.amount}`)}
${row("WAKTU", input.when)}
${row("TEMPAT", input.where)}
<p style="margin:22px 0 0;font-size:14px;color:#4b5563">Tunjukkan tiket ini ke panitia pada hari H.</p>
</main></body></html>`;
}
