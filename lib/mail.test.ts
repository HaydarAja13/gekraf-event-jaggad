import assert from "node:assert/strict";
import test from "node:test";
import { ticketMessage } from "./mail.ts";

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
