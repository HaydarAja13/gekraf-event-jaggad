import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { getSite } from "@/lib/site";
import { getTicketSettings } from "@/lib/ticket-settings";
import { ticketMessage } from "@/lib/mail";
import { requestOrigin } from "@/lib/origin";
import { getSmtpSettings } from "@/lib/smtp";
import { FullTicketPreview } from "./view";

export default function TicketPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#edf2f7] text-dash-muted">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-dash-fill border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Memuat pratinjau tiket…</p>
          </div>
        </div>
      }
    >
      <TicketPreviewContent />
    </Suspense>
  );
}

async function TicketPreviewContent() {
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  const [site, settings, origin, smtp] = await Promise.all([
    getSite(),
    getTicketSettings(),
    requestOrigin(),
    getSmtpSettings(),
  ]);

  // Alamat asal yang sebenarnya (di produksi: https://gekraf.jaggadacademy.id),
  // bukan domain keras, supaya pratinjau sama dengan isi email sungguhan.
  const sender = smtp
    ? `${smtp.fromName} <${smtp.fromEmail}>`
    : "Pengirim email (atur dulu di Pengaturan Email)";

  // Generate live sample email preview using current settings
  const sampleMessage = ticketMessage({
    fullName: "Ahmad Rizky Pratama",
    plan: "VIP Exclusive Pass",
    amount: "Rp 1.499.000",
    ticketNo: "BSM-74829-VIP",
    pageUrl: `${origin}/tiket/BSM-74829-VIP`,
    downloadUrl: `${origin}/tiket/BSM-74829-VIP/unduh`,
    when: `${site.hero.date}, ${site.hero.time}`,
    where: `${site.hero.venue}, ${site.hero.city}`,
    event: settings.eventTitle || "BUSINESS SKILL MASTERY",
    badge: settings.badge || "E-TIKET RESMI · VIP PASS",
    to: "peserta@example.com",
    pamphletUrl: settings.pamphletUrl || "/pamflet.jpeg",
    subtitle: settings.eventSubtitle,
    greeting: settings.greeting,
    instructions: settings.instructions,
    supportWhatsapp: settings.supportWhatsapp,
    supportLabel: settings.supportLabel,
    organizer: settings.organizer,
  });

  return (
    <FullTicketPreview
      html={sampleMessage.html}
      eventTitle={settings.eventTitle || "BUSINESS SKILL MASTERY"}
      pamphletUrl={settings.pamphletUrl || "/pamflet.jpeg"}
      sender={sender}
    />
  );
}
