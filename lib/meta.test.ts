import assert from "node:assert/strict";
import test from "node:test";
import { metaPhone, publicMetaError, readMetaForm, sha256Hex, splitName } from "./meta.ts";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

test("nomor Indonesia dapat kode negara sebelum di-hash", () => {
  assert.equal(metaPhone("0812-9998-8877"), "6281299988877");
  assert.equal(metaPhone("+62 812 9998 8877"), "6281299988877");
});

test("nama dipecah dan huruf kecil", () => {
  assert.deepEqual(splitName("Haydar Uji"), { fn: "haydar", ln: "uji" });
});

test("hash email stabil", () => {
  assert.equal(sha256Hex("a@b.co"), sha256Hex("a@b.co"));
  assert.notEqual(sha256Hex("a@b.co"), sha256Hex("a@b.com"));
});

test("form menolak pixel yang bukan angka dan menyimpan kode uji kosong", () => {
  const bad = readMetaForm(form({ pixelId: "ABC", accessToken: "token", testEventCode: "" }));
  assert.equal(bad.ok, false);
  const data = form({ pixelId: "1234567890", accessToken: "token", testEventCode: "TEST123" });
  data.set("enabled", "1");
  const ok = readMetaForm(data);
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.equal(ok.value.enabled, true);
  assert.equal(ok.value.testEventCode, "TEST123");
});

test("pesan error tidak mengulang token", () => {
  assert.equal(publicMetaError("token ditolak token", "token"), "•••• ditolak ••••");
});
