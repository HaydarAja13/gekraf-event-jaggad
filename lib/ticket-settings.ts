import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

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

const file = path.join(process.cwd(), "data", "ticket-settings.json");

export async function getTicketSettings(): Promise<TicketSettings> {
  "use cache";
  cacheTag("ticket-settings");
  cacheLife("max");
  try {
    const raw = await readFile(file, "utf8");
    const data = JSON.parse(raw) as Partial<TicketSettings>;
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
  } catch {
    return defaultTicketSettings;
  }
}

export async function saveTicketSettings(input: Partial<TicketSettings>) {
  const current = await getTicketSettings();
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
  await writeFile(file, JSON.stringify(next, null, 2) + "\n", "utf8");
  return { ok: true as const, settings: next };
}
