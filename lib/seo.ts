import type { Site } from "@/lib/types";

/** Domain publik kanonik.
 *
 *  Deployment preview Vercel punya URL acak yang tidak boleh masuk indeks,
 *  jadi canonical, sitemap, robots, dan gambar OG harus selalu menunjuk ke
 *  domain produksi. Pindah domain cukup lewat NEXT_PUBLIC_SITE_URL.
 *  Catatan: gekraf.jaggadacademy.id (tanpa "s") di-redirect Vercel ke sini. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gekrafs.jaggadacademy.id"
).replace(/\/+$/, "");

export const SITE_NAME = "Business Skill Mastery";

export const ORGANIZER = "DPD GEKRAF Jawa Tengah × Jaggad Academy";

/** 1200x630 — ukuran yang dipakai WhatsApp, X, Facebook, dan LinkedIn. */
export const OG_IMAGE = {
  url: "/og-cover.jpg",
  type: "image/jpeg",
  width: 1200,
  height: 630,
  alt: "Business Skill Mastery — National Business Growth Class, 21 November 2026, Gets Hotel Semarang",
};

export function absolute(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

const MONTHS: Record<string, string> = {
  januari: "01",
  februari: "02",
  maret: "03",
  april: "04",
  mei: "05",
  juni: "06",
  juli: "07",
  agustus: "08",
  september: "09",
  oktober: "10",
  november: "11",
  desember: "12",
};

/** "Sabtu, 21 November 2026" → "2026-11-21". Null kalau formatnya berubah. */
function isoDate(value: string) {
  const match = value.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  const month = match ? MONTHS[match[2].toLowerCase()] : undefined;
  if (!match || !month) return null;
  return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
}

/** "07.00 – 17.00 WIB" → jam mulai/selesai lengkap dengan offset zona waktu. */
function isoTime(value: string) {
  const clocks = [...value.matchAll(/(\d{1,2})[.:](\d{2})/g)];
  if (clocks.length === 0) return null;
  const clock = (match: RegExpMatchArray) =>
    `${match[1].padStart(2, "0")}:${match[2]}`;
  const offset = /WITA\b/.test(value)
    ? "+08:00"
    : /WIT\b/.test(value)
      ? "+09:00"
      : "+07:00";
  return {
    start: `${clock(clocks[0])}:00${offset}`,
    end: clocks[1] ? `${clock(clocks[1])}:00${offset}` : null,
  };
}

/** "Rp 999.000" → 999000. */
function rupiah(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

/** Structured data untuk Google Rich Results: acara, tiket, dan FAQ.
 *
 *  Tanggal/jam dibaca dari teks CMS (bukan hardcode) supaya tetap benar kalau
 *  operator mengubah jadwal; kalau formatnya tidak dikenali, field tanggal
 *  dihilangkan daripada mengirim data salah. */
export function structuredData(site: Site) {
  const page = absolute("/");
  const date = isoDate(site.hero.date);
  const time = isoTime(site.hero.time);
  const [city, region] = site.hero.city.split(",").map((part) => part.trim());

  const event: Record<string, unknown> = {
    "@type": "Event",
    "@id": `${page}#event`,
    name: site.seo.title,
    description: site.hero.body,
    url: page,
    image: [absolute(OG_IMAGE.url), absolute("/pamflet.jpeg")],
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "id-ID",
    location: {
      "@type": "Place",
      name: site.hero.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: city || "Semarang",
        addressRegion: region || "Jawa Tengah",
        addressCountry: "ID",
      },
    },
    organizer: { "@type": "Organization", name: ORGANIZER, url: page },
    performer: site.speakers.people.map((person) => ({
      "@type": "Person",
      name: person.name,
      jobTitle: person.title,
    })),
    offers: site.pricing.plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: rupiah(plan.price) ?? undefined,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: absolute(`/checkout?plan=${encodeURIComponent(plan.name)}`),
    })),
  };
  if (date && time) {
    event.startDate = `${date}T${time.start}`;
    if (time.end) event.endDate = `${date}T${time.end}`;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${page}#organization`,
        name: ORGANIZER,
        url: page,
        logo: absolute("/logo.png"),
      },
      {
        "@type": "WebSite",
        "@id": `${page}#website`,
        url: page,
        name: site.seo.title,
        description: site.seo.description,
        inLanguage: "id-ID",
        publisher: { "@id": `${page}#organization` },
      },
      event,
      {
        "@type": "FAQPage",
        "@id": `${page}#faq`,
        mainEntity: site.faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}
