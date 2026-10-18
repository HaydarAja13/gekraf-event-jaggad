import assert from "node:assert/strict";
import test from "node:test";
import jsQR from "jsqr";
import { ticketMailPayload, ticketMessage } from "./mail.ts";

const sample = {
  fullName: "Haydar <panitia>",
  plan: "EARLYBIRD",
  amount: "Rp 999.000",
  ticketNo: "BSM-AB12CD34",
  pageUrl: "https://acara.example/tiket/BSM-AB12CD34",
  downloadUrl: "https://acara.example/tiket/BSM-AB12CD34/unduh",
  when: "Sabtu, 21 November 2026, 07.00 – 17.00 WIB",
  where: "Gets Hotel Semarang, Semarang, Jawa Tengah",
  event: "BUSINESS SKILL MASTERY",
  badge: "National Business Growth Class",
  to: "peserta@example.com",
};

test("email tiket memuat data peserta dan menolak sisipan html", () => {
  const message = ticketMessage(sample);
  assert.equal(message.subject, "Tiket BSM-AB12CD34 — BUSINESS SKILL MASTERY");
  assert.match(message.html, /Haydar &lt;panitia&gt;/);
  assert.equal(message.html.includes("Haydar <panitia>"), false);
  assert.match(message.html, /BSM-AB12CD34/);
  assert.match(message.html, /Gets Hotel Semarang/);
  assert.match(message.html, /Buka tiket/);
  assert.match(message.text, /Nomor tiket: BSM-AB12CD34/);
});

test("payload email: QR tercetak di body, pamflet lampiran biasa, body aman dari clip", async () => {
  const payload = await ticketMailPayload(sample);

  assert.equal(
    payload.attachments.some((item) => item.cid),
    false,
    "tidak boleh ada lampiran inline — QR harus jadi bagian dari body",
  );
  assert.equal(payload.attachments.length, 1, "hanya pamflet yang boleh menjadi lampiran");
  const poster = payload.attachments.find((item) => item.filename === "pamflet.jpeg");
  assert.ok(poster, "pamflet harus terlampir sebagai lampiran biasa");

  assert.match(payload.html, /table-layout:fixed/);
  assert.match(
    payload.html,
    /class="qr-plate" style="background:#0299c3; background-image:linear-gradient\(#0299c3,#0299c3\)/,
    "kartu di belakang QR harus cyan brand #0299c3 dan dikunci lewat background-image",
  );
  assert.match(
    payload.html,
    /background-image:linear-gradient\(#0299c3,#0299c3\)/,
    "sel terang QR (cyan brand yang terbukti selamat dari dark mode HP) harus dikunci",
  );
  assert.match(
    payload.html,
    /background-image:linear-gradient\(#0b1118,#0b1118\)/,
    "modul hitam QR juga harus dikunci agar tetap hitam di dark mode",
  );
  assert.match(
    payload.html,
    /@media \(prefers-color-scheme: dark\)/,
    "aturan warna QR untuk dark mode harus ikut dikirim",
  );
  assert.match(payload.html, /name="color-scheme" content="light dark"/);
  assert.equal(payload.html.includes("<img"), false, "body tidak boleh memuat gambar sama sekali");
  assert.equal(payload.html.includes("api.qrserver.com"), false);
  assert.equal(payload.html.includes("cid:"), false);
  assert.ok(
    Buffer.byteLength(payload.html) < 95_000,
    "body email harus jauh di bawah batas clip Gmail",
  );
});

test("QR di email bisa dipindai ulang oleh pemindai independen", () => {
  const message = ticketMessage(sample);
  const table = message.html.match(
    /<table[^>]*table-layout:fixed[^>]*>([\s\S]*?)<\/table>/,
  )?.[1];
  assert.ok(table, "tabel QR harus ada di body email");

  const matrix = (table.match(/<tr>([\s\S]*?)<\/tr>/g) ?? []).map((row) =>
    [...row.matchAll(/<td ([^>]*)>/g)].flatMap((match) => {
      const attrs = match[1];
      const span = Number(attrs.match(/colspan="(\d+)"/)?.[1] ?? 1);
      const dark = /bgcolor="#0b1118"/.test(attrs);
      return Array.from({ length: span }, () => dark);
    }),
  );

  const width = matrix[0]?.length ?? 0;
  assert.ok(width > 20, "matriks QR harus punya ukuran wajar");
  assert.ok(matrix.length === width, "matriks QR harus persegi");
  assert.ok(
    matrix.every((row) => row.length === width),
    "setiap baris QR harus sama lebar",
  );

  const scale = 8;
  const pixels = new Uint8ClampedArray(width * scale * matrix.length * scale * 4);
  for (let y = 0; y < matrix.length * scale; y += 1) {
    for (let x = 0; x < width * scale; x += 1) {
      const value = matrix[Math.floor(y / scale)][Math.floor(x / scale)] ? 0 : 255;
      const idx = (y * width * scale + x) * 4;
      pixels[idx] = value;
      pixels[idx + 1] = value;
      pixels[idx + 2] = value;
      pixels[idx + 3] = 255;
    }
  }

  const decoded = jsQR(pixels, width * scale, matrix.length * scale);
  assert.equal(decoded?.data, sample.pageUrl, "isi QR harus persis URL tiket peserta");
});
