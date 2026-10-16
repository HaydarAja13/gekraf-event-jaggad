import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { verifyPassword } from "@/lib/password";
import { readSession, signSession } from "@/lib/session-token";

const usersFile = path.join(process.cwd(), "data", "users.json");
const COOKIE = "admin_session";
const WEEK = 60 * 60 * 24 * 7;

type UserRow = { username: string; password: string };

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET belum diisi di .env.local");
  return value;
}

async function users() {
  return JSON.parse(await readFile(usersFile, "utf8")) as UserRow[];
}

export async function login(username: string, password: string) {
  const row = (await users()).find((user) => user.username === username);
  if (!row || !verifyPassword(password, row.password)) return false;
  const token = signSession(row.username, Date.now() + WEEK * 1000, secret());
  const https = (await headers()).get("x-forwarded-proto") === "https";
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: WEEK,
  });
  return true;
}

export async function getAdmin() {
  await connection();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return readSession(token, secret());
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return admin;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}
