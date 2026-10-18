import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HOST_SHAPE = /^[A-Za-z0-9.-]+$/;

export type SmtpInput = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

export type SmtpPublic = Omit<SmtpInput, "password"> & { hasPassword: boolean };

type SmtpRow = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string;
  from_email: string;
};

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_SECRET_KEY belum diisi");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function validEmail(value: string) {
  return EMAIL_SHAPE.test(value);
}

export function formatFrom(name: string, email: string) {
  const clean = name.replace(/[\r\n"]/g, "").trim();
  return `"${clean}" <${email}>`;
}

export function publicSmtpError(error: unknown, secret: string) {
  const raw = error instanceof Error ? error.message : "SMTP gagal";
  const cleaned = secret ? raw.split(secret).join("••••") : raw;
  return cleaned.replace(/\s+/g, " ").slice(0, 180);
}

export function readSmtpForm(formData: FormData): { ok: true; value: SmtpInput } | { ok: false; error: string } {
  const host = String(formData.get("host") ?? "").trim();
  const port = Number(String(formData.get("port") ?? "").trim());
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fromName = String(formData.get("fromName") ?? "").trim();
  const fromEmail = String(formData.get("fromEmail") ?? "").trim().toLowerCase();
  if (!HOST_SHAPE.test(host)) return { ok: false, error: "Host SMTP belum benar." };
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, error: "Port SMTP harus angka 1–65535." };
  if (!username) return { ok: false, error: "Username SMTP wajib diisi." };
  if (!fromName) return { ok: false, error: "Nama pengirim wajib diisi." };
  if (!validEmail(fromEmail)) return { ok: false, error: "Email pengirim belum benar." };
  return {
    ok: true,
    value: {
      host,
      port,
      secure: formData.get("secure") === "1",
      username,
      password,
      fromName,
      fromEmail,
    },
  };
}

function mapPublic(row: SmtpRow): SmtpPublic {
  return {
    host: row.host,
    port: row.port,
    secure: row.secure,
    username: row.username,
    fromName: row.from_name,
    fromEmail: row.from_email,
    hasPassword: row.password.length > 0,
  };
}

async function loadRow() {
  const { data, error } = await db()
    .from("smtp_settings")
    .select("host, port, secure, username, password, from_name, from_email")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SmtpRow | null) ?? null;
}

export async function getSmtpSettings() {
  const row = await loadRow();
  return row ? mapPublic(row) : null;
}

export async function saveSmtp(input: SmtpInput) {
  const existing = await loadRow();
  const password = input.password || existing?.password || "";
  if (!password) return { ok: false as const, error: "Password SMTP wajib diisi." };
  const { error } = await db().from("smtp_settings").upsert(
    {
      id: 1,
      host: input.host,
      port: input.port,
      secure: input.secure,
      username: input.username,
      password,
      from_name: input.fromName,
      from_email: input.fromEmail,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (!error) return { ok: true as const };
  if (error.code === "23514") return { ok: false as const, error: "Host, port, atau email pengirim tidak valid." };
  return { ok: false as const, error: error.message };
}

function transport(row: SmtpRow) {
  return nodemailer.createTransport({
    host: row.host,
    port: row.port,
    secure: row.secure,
    auth: { user: row.username, pass: row.password },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
}

export type MailAttachment = {
  filename?: string | false;
  path?: string;
  content?: Buffer | string;
  cid?: string;
  contentType?: string;
};

export async function deliverMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
}) {
  const row = await loadRow();
  if (!row) {
    return { ok: false as const, error: "SMTP belum diatur. Isi pengaturan di menu Pengiriman." };
  }
  try {
    await transport(row).sendMail({
      from: formatFrom(row.from_name, row.from_email),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      attachments: input.attachments,
    });
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: publicSmtpError(error, row.password) };
  }
}

export async function verifySmtp() {
  const row = await loadRow();
  if (!row) return { ok: false as const, error: "SMTP belum diatur." };
  try {
    await transport(row).verify();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: publicSmtpError(error, row.password) };
  }
}
