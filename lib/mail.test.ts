import assert from "node:assert/strict";
import test from "node:test";
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

test("payload email: pamflet lampiran biasa, QR dari layanan gambar, body kecil", async () => {
  const payload = await ticketMailPayload(sample);

  assert.equal(
    payload.attachments.some((item) => item.cid),
    false,
    "tidak boleh ada lampiran inline — QR tampil sebagai gambar biasa di body",
  );

  const poster = payload.attachments.find((item) => item.filename === "pamflet.jpeg");
  assert.ok(poster, "pamflet harus terlampir sebagai lampiran biasa");
  assert.equal(poster?.cid, undefined);

  assert.match(payload.html, /api\.qrserver\.com/);
  assert.equal(payload.html.includes("cid:pamflet-acara"), false);
  assert.ok(
    Buffer.byteLength(payload.html) < 60_000,
    "body email harus jauh di bawah batas clip Gmail",
  );
});
