import { createHmac, timingSafeEqual } from "node:crypto";

export function signSession(username: string, exp: number, secret: string) {
  const payload = `${username}.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function readSession(token: string, secret: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expRaw, sig] = parts;
  if (!username || !expRaw || !sig) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < now) return null;
  const expected = createHmac("sha256", secret)
    .update(`${username}.${expRaw}`)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { username };
}
