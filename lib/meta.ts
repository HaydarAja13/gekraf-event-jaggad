import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const GRAPH = "v23.0";
const PIXEL_SHAPE = /^[0-9]{5,20}$/;
const TEST_CODE_SHAPE = /^[A-Za-z0-9]{0,32}$/;

export type MetaInput = {
  pixelId: string;
  accessToken: string;
  testEventCode: string;
  enabled: boolean;
};

export type MetaPublic = {
  pixelId: string;
  testEventCode: string;
  enabled: boolean;
  hasToken: boolean;
};

type MetaRow = {
  pixel_id: string;
  access_token: string;
  test_event_code: string;
  enabled: boolean;
};

type MetaEventName = "Lead" | "Purchase";

export type MetaTrack = {
  eventName: MetaEventName;
  eventId: string;
  sourceUrl: string;
  email?: string;
  phone?: string;
  name?: string;
  value?: number;
  contentName?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_SECRET_KEY belum diisi");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** 0812… menjadi 62812…. Meta minta kode negara, tanpa tanda tambah. */
export function metaPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.length >= 9 && digits.length <= 13) return `62${digits}`;
  return digits;
}

export function splitName(value: string) {
  const parts = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  return { fn: parts[0] ?? "", ln: parts.slice(1).join(" ") };
}

export function publicMetaError(error: string, secret: string) {
  const cleaned = secret ? error.split(secret).join("••••") : error;
  return cleaned.replace(/\s+/g, " ").slice(0, 220);
}

export function readMetaForm(formData: FormData): { ok: true; value: MetaInput } | { ok: false; error: string } {
  const pixelId = String(formData.get("pixelId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const testEventCode = String(formData.get("testEventCode") ?? "").trim();
  if (!PIXEL_SHAPE.test(pixelId)) return { ok: false, error: "Pixel ID harus angka dari Events Manager." };
  if (!TEST_CODE_SHAPE.test(testEventCode)) return { ok: false, error: "Kode uji hanya huruf dan angka." };
  return {
    ok: true,
    value: {
      pixelId,
      accessToken,
      testEventCode,
      enabled: formData.get("enabled") === "1",
    },
  };
}

async function loadRow() {
  const { data, error } = await db()
    .from("meta_settings")
    .select("pixel_id, access_token, test_event_code, enabled")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as MetaRow | null) ?? null;
}

export async function metaPixelId() {
  try {
    const row = await loadRow();
    if (!row?.enabled || !PIXEL_SHAPE.test(row.pixel_id)) return null;
    return row.pixel_id;
  } catch {
    return null;
  }
}

export async function getMetaSettings() {
  const row = await loadRow();
  if (!row) return null;
  return {
    pixelId: row.pixel_id,
    testEventCode: row.test_event_code,
    enabled: row.enabled,
    hasToken: row.access_token.length > 0,
  } satisfies MetaPublic;
}

export async function saveMeta(input: MetaInput) {
  const existing = await loadRow();
  const accessToken = input.accessToken || existing?.access_token || "";
  if (!accessToken) return { ok: false as const, error: "Access token Conversions API wajib diisi." };
  const { error } = await db().from("meta_settings").upsert(
    {
      id: 1,
      pixel_id: input.pixelId,
      access_token: accessToken,
      test_event_code: input.testEventCode,
      enabled: input.enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (!error) return { ok: true as const };
  if (error.code === "42P01") {
    return { ok: false as const, error: "Tabel pengaturan Meta belum ada di database." };
  }
  if (error.code === "23514") return { ok: false as const, error: "Pixel ID atau kode uji tidak valid." };
  return { ok: false as const, error: error.message };
}

async function graph(row: MetaRow, path: string, init?: RequestInit, timeout = 12_000) {
  const url = new URL(`https://graph.facebook.com/${GRAPH}/${path}`);
  url.searchParams.set("access_token", row.access_token);
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });
  const json = (await response.json()) as {
    name?: string;
    events_received?: number;
    error?: { message?: string };
  };
  if (!response.ok || json.error) {
    return { ok: false as const, error: publicMetaError(json.error?.message ?? "Meta menolak permintaan.", row.access_token) };
  }
  return { ok: true as const, json };
}

/** Proves the token can read this pixel. */
export async function verifyMeta() {
  const row = await loadRow();
  if (!row) return { ok: false as const, error: "Pengaturan Meta belum disimpan." };
  const result = await graph(row, `${row.pixel_id}?fields=name`);
  if (!result.ok) return result;
  return { ok: true as const, name: result.json.name || row.pixel_id };
}

export async function sendMetaTest(sourceUrl: string) {
  const row = await loadRow();
  if (!row) return { ok: false as const, error: "Simpan Pixel ID dan token dulu." };
  if (!row.test_event_code) {
    return { ok: false as const, error: "Isi kode uji dari tab Test events di Events Manager." };
  }
  const result = await graph(row, `${row.pixel_id}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      test_event_code: row.test_event_code,
      data: [
        {
          event_name: "PageView",
          event_time: Math.floor(Date.now() / 1000),
          event_id: `test-${Date.now()}`,
          action_source: "website",
          event_source_url: sourceUrl,
          user_data: { client_user_agent: "Mozilla/5.0 MetaSettingsTest" },
        },
      ],
    }),
  });
  if (!result.ok) return result;
  return { ok: true as const, received: result.json.events_received ?? 0 };
}

function hashedUser(input: MetaTrack) {
  const data: Record<string, string | string[]> = {};
  const email = input.email?.trim().toLowerCase() ?? "";
  if (email) {
    const hash = sha256Hex(email);
    data.em = [hash];
    data.external_id = [hash];
  }
  const phone = input.phone ? metaPhone(input.phone) : "";
  if (phone) data.ph = [sha256Hex(phone)];
  const { fn, ln } = splitName(input.name ?? "");
  if (fn) data.fn = [sha256Hex(fn)];
  if (ln) data.ln = [sha256Hex(ln)];
  if (input.ip) data.client_ip_address = input.ip;
  if (input.userAgent) data.client_user_agent = input.userAgent;
  if (input.fbp) data.fbp = input.fbp;
  if (input.fbc) data.fbc = input.fbc;
  return data;
}

/** Best-effort. A Meta outage must not block checkout or ACC. */
export async function trackMeta(input: MetaTrack) {
  try {
    const row = await loadRow();
    if (!row?.enabled || !row.access_token) return;
    const custom: Record<string, string | number> = { currency: "IDR" };
    if (input.value && input.value > 0) custom.value = input.value;
    if (input.contentName) custom.content_name = input.contentName;
    await graph(row, `${row.pixel_id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: input.eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: input.eventId,
            action_source: "website",
            event_source_url: input.sourceUrl,
            user_data: hashedUser(input),
            custom_data: custom,
          },
        ],
      }),
    }, 5_000);
  } catch {
    // Checkout and ACC stay successful even when Meta is down.
  }
}
