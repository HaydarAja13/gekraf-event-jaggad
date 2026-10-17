import assert from "node:assert/strict";
import test from "node:test";
import { formatFrom, publicSmtpError, readSmtpForm } from "./smtp.ts";

const valid = {
  host: "smtp.sumopod.com",
  port: "465",
  secure: "1",
  username: "user",
  password: "secret",
  fromName: "Panitia",
  fromEmail: "Tiket@Example.com",
};

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

test("form Sumopod terbaca", () => {
  const parsed = readSmtpForm(form(valid));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.host, "smtp.sumopod.com");
  assert.equal(parsed.value.port, 465);
  assert.equal(parsed.value.secure, true);
  assert.equal(parsed.value.fromEmail, "tiket@example.com");
});

test("SSL mati kalau kotak tidak dicentang dan password boleh kosong", () => {
  const data = form({ ...valid, password: "" });
  data.delete("secure");
  const parsed = readSmtpForm(data);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.secure, false);
  assert.equal(parsed.value.password, "");
});

test("host, port, dan email pengirim ditolak", () => {
  assert.equal(readSmtpForm(form({ ...valid, host: "smtp sumopod.com" })).ok, false);
  assert.equal(readSmtpForm(form({ ...valid, port: "0" })).ok, false);
  assert.equal(readSmtpForm(form({ ...valid, fromEmail: "bukan-email" })).ok, false);
});

test("nama pengirim tidak bisa menyisipkan header", () => {
  assert.equal(formatFrom('Panitia "BSM"\r\nBcc: x@y.z', "a@b.co"), '"Panitia BSMBcc: x@y.z" <a@b.co>');
});

test("pesan error tidak memuat password", () => {
  const error = new Error("535 auth failed for secret-pass");
  assert.equal(publicSmtpError(error, "secret-pass").includes("secret-pass"), false);
});
