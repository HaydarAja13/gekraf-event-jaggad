import assert from "node:assert/strict";
import test from "node:test";
import { waNumber, waTicketMessage, waTicketUrl } from "./whatsapp.ts";

const ticket = {
  fullName: "Ahmad Rizky Pratama",
  plan: "VIP Exclusive Pass",
  ticketNo: "BSM-0007",
  event: "BUSINESS SKILL MASTERY",
  when: "Sabtu, 24 Oktober 2026, 09.00 WIB",
  where: "Hotel Tentrem, Semarang",
  pageUrl: "https://gekraf.example/tiket/BSM-0007",
};

test("nomor WhatsApp dinormalisasi ke format internasional", () => {
  assert.equal(waNumber("0822-4198-9936"), "6282241989936");
  assert.equal(waNumber("+62 822 4198 9936"), "6282241989936");
  assert.equal(waNumber("822 4198 9936"), "6282241989936");
  assert.equal(waNumber("12345"), null);
  assert.equal(waNumber(""), null);
});

test("teks tiket memuat data peserta dan tautan tiket", () => {
  const text = waTicketMessage(ticket);
  assert.match(text, /BSM-0007/);
  assert.match(text, /Ahmad Rizky Pratama/);
  assert.match(text, /VIP Exclusive Pass/);
  assert.match(text, /https:\/\/gekraf\.example\/tiket\/BSM-0007/);
  assert.match(text, /Hotel Tentrem, Semarang/);
});

test("tautan wa.me memakai nomor peserta dan teks yang ter-encode", () => {
  const url = waTicketUrl("0822-4198-9936", ticket);
  assert.ok(url);
  assert.match(url, /^https:\/\/wa\.me\/6282241989936\?text=/);
  const encoded = url.slice(url.indexOf("?text=") + 6);
  assert.equal(decodeURIComponent(encoded), waTicketMessage(ticket));
});

test("nomor tidak valid tidak menghasilkan tautan", () => {
  assert.equal(waTicketUrl("12345", ticket), null);
});
