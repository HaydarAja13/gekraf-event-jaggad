import { cacheLife, cacheTag } from "next/cache";
import { readCms, writeCms } from "@/lib/cms";

export type TicketSettings = {
  eventTitle: string;
  eventSubtitle: string;
  badge: string;
  pamphletUrl: string;
  greeting: string;
  instructions: string[];
  supportWhatsapp: string;
  supportLabel: string;
  organizer: string;
};

export const defaultTicketSettings: TicketSettings = {
  eventTitle: "BUSINESS SKILL MASTERY",
  eventSubtitle: "Solusi In This Economy · Exclusive Masterclass",
  badge: "E-TIKET RESMI · VIP PASS",
  pamphletUrl: "/pamflet.jpeg",
  greeting:
    "Halo {name}, pembayaran paket {plan} telah kami terima dan terkonfirmasi. Simpan e-tiket ini dan tunjukkan QR Code kepada panitia pada hari acara.",
  instructions: [
    "Tunjukkan QR Code atau Nomor Tiket pada email ini ke meja registrasi di lokasi acara.",
    "Wajib membawa kartu identitas diri (KTP / SIM / Paspor) yang sah sesuai nama peserta.",
    "Pintu registrasi dibuka mulai pukul 07.00 WIB. Disarankan hadir 30 menit lebih awal untuk kelancaran registrasi.",
    "E-tiket ini bersifat unik dan hanya berlaku untuk 1 (satu) kali penukaran wristband / ID Card resmi.",
  ],
  supportWhatsapp: "6282221768800",
  supportLabel: "Hubungi Panitia via WhatsApp",
  organizer: "DPD GEKRAF Jawa Tengah × Jaggad Academy",
};

/** Disimpan di Supabase Storage, bukan data/ticket-settings.json: filesystem
 *  Vercel read-only, jadi tulisan ke disk selalu gagal di production. */
const file = "ticket/ticket-settings.json";

function normalize(data: Partial<TicketSettings> | null): TicketSettings {
  if (!data) return defaultTicketSettings;
  return {
    eventTitle: data.eventTitle?.trim() || defaultTicketSettings.eventTitle,
    eventSubtitle: data.eventSubtitle?.trim() || defaultTicketSettings.eventSubtitle,
    badge: data.badge?.trim() || defaultTicketSettings.badge,
    pamphletUrl: data.pamphletUrl?.trim() || defaultTicketSettings.pamphletUrl,
    greeting: data.greeting?.trim() || defaultTicketSettings.greeting,
    instructions:
      Array.isArray(data.instructions) && data.instructions.length > 0
        ? data.instructions.filter((item) => typeof item === "string" && item.trim())
        : defaultTicketSettings.instructions,
    supportWhatsapp: data.supportWhatsapp?.trim() || defaultTicketSettings.supportWhatsapp,
    supportLabel: data.supportLabel?.trim() || defaultTicketSettings.supportLabel,
    organizer: data.organizer?.trim() || defaultTicketSettings.organizer,
  };
}

async function loadTicketSettings() {
  return normalize(await readCms<Partial<TicketSettings>>(file));
}

export async function getTicketSettings(): Promise<TicketSettings> {
  "use cache";
  cacheTag("ticket-settings");
  cacheLife("max");
  try {
    return await loadTicketSettings();
  } catch {
    return defaultTicketSettings;
  }
}

export async function saveTicketSettings(input: Partial<TicketSettings>) {
  let current: TicketSettings;
  try {
    current = await loadTicketSettings();
  } catch {
    return { ok: false as const, error: "Pengaturan tiket gagal dibaca dari server. Coba lagi." };
  }
  const next: TicketSettings = {
    eventTitle: input.eventTitle?.trim() || current.eventTitle,
    eventSubtitle: input.eventSubtitle?.trim() || current.eventSubtitle,
    badge: input.badge?.trim() || current.badge,
    pamphletUrl: input.pamphletUrl?.trim() || current.pamphletUrl,
    greeting: input.greeting?.trim() || current.greeting,
    instructions:
      Array.isArray(input.instructions) && input.instructions.length > 0
        ? input.instructions.map((item) => item.trim()).filter(Boolean)
        : current.instructions,
    supportWhatsapp: input.supportWhatsapp?.trim() || current.supportWhatsapp,
    supportLabel: input.supportLabel?.trim() || current.supportLabel,
    organizer: input.organizer?.trim() || current.organizer,
  };
  try {
    await writeCms(file, next);
  } catch {
    return { ok: false as const, error: "Pengaturan tiket gagal disimpan ke server. Coba lagi." };
  }
  return { ok: true as const, settings: next };
}
