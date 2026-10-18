import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hashPassword, verifyPassword } from "./password.ts";
import { readSession, signSession } from "./session-token.ts";

test("seeded admin row accepts the current admin password", () => {
  const users = JSON.parse(
    readFileSync(new URL("../data/users.json", import.meta.url), "utf8"),
  ) as { username: string; password: string }[];
  const admin = users.find((user) => user.username === "admin");
  assert.ok(admin);
  assert.equal(verifyPassword("gekrafjaggad5657", admin.password), true);
  assert.equal(verifyPassword("admin123", admin.password), false);
});

test("password hash matches its input and rejects a wrong one", () => {
  const stored = hashPassword("sandi-uji-123");
  assert.equal(verifyPassword("sandi-uji-123", stored), true);
  assert.equal(verifyPassword("sandi-uji-124", stored), false);
  assert.equal(verifyPassword("sandi-uji-123", "not-a-hash"), false);
});

test("session token accepts a valid signature and rejects tampering", () => {
  const secret = "test-secret";
  const token = signSession("admin", Date.now() + 60_000, secret);
  assert.equal(readSession(token, secret)?.username, "admin");
  assert.equal(readSession(token, "other"), null);
  assert.equal(readSession(token.slice(0, -2) + "zz", secret), null);
  const expired = signSession("admin", Date.now() - 1_000, secret);
  assert.equal(readSession(expired, secret), null);
});
