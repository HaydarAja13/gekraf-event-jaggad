export type Site = {
  seo: { title: string; description: string };
  navbar: {
    logoSrc: string;
    logoAlt: string;
    brand: string;
    ctaLabel: string;
    ctaHref: string;
    links: { href: string; label: string }[];
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleGold: string;
    titleRest: string;
    subtitle: string;
    body: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    ctaLabel: string;
    ctaHref: string;
    quota: string;
    backgroundSrc: string;
    speakers: { name: string; role: string; src: string }[];
  };
  pain: {
    badge: string;
    title: string;
    body: string;
    cards: { title: string; caption: string }[];
  };
  audience: {
    badge: string;
    title: string;
    body: string;
    items: { label: string }[];
  };
  speakers: {
    badge: string;
    title: string;
    body: string;
    people: {
      name: string;
      title: string;
      badge: string;
      headline: string;
      src: string;
      points: string[];
    }[];
  };
  curriculum: {
    badge: string;
    title: string;
    body: string;
    modules: { title: string; desc: string }[];
  };
  why: {
    badge: string;
    title: string;
    body: string;
    benefits: { line1: string; line2: string }[];
  };
  testimonials: {
    badge: string;
    title: string;
    body: string;
    items: { name: string; role: string; text: string; src: string }[];
  };
  pricing: {
    badge: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
    plans: { name: string; priceWas: string; price: string; slots: string; features: string[] }[];
  };
  social: {
    badge: string;
    line: string;
    /* Nama dan foto saja: notifikasi ini tentang pembelian, bukan jabatan. */
    items: { name: string; src: string }[];
  };
  faq: {
    badge: string;
    title: string;
    body: string;
    items: { q: string; a: string }[];
  };
  cta: {
    badge: string;
    title: string;
    body: string;
    button: string;
    buttonHref: string;
    whatsappText: string;
    whatsappNumber: string;
    whatsappHref: string;
    image: string;
  };
};

export const SECTIONS = [
  { id: "seo", label: "SEO", hint: "Judul dan deskripsi yang tampil di tab browser." },
  { id: "navbar", label: "Navigasi", hint: "Logo, nama, menu, dan tombol daftar." },
  { id: "hero", label: "Hero", hint: "Bagian pembuka, tanggal, lokasi, dan foto pemateri." },
  { id: "pain", label: "Situasi", hint: "Judul dan empat kartu masalah." },
  { id: "audience", label: "Untuk Siapa", hint: "Audiens yang cocok mengikuti kelas." },
  { id: "speakers", label: "Pemateri", hint: "Profil, badge, dan poin materi tiap pembicara." },
  { id: "curriculum", label: "Kurikulum", hint: "Judul dan daftar modul." },
  { id: "why", label: "Kenapa Memilih", hint: "Alasan dan empat benefit." },
  { id: "testimonials", label: "Testimoni", hint: "Nama, peran, kutipan, dan foto." },
  {
    id: "social",
    label: "Pembelian Terbaru",
    hint: "Popup kiri bawah yang muncul berulang: nama dan foto pembeli.",
  },
  { id: "pricing", label: "Harga", hint: "Paket, harga coret, harga asli, dan jumlah slot." },
  { id: "faq", label: "FAQ", hint: "Pertanyaan dan jawaban." },
  { id: "cta", label: "Ajakan Terakhir", hint: "Penutup, tombol daftar, dan WhatsApp." },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
