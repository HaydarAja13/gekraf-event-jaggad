import { cacheLife, cacheTag } from "next/cache";
import seed from "@/data/site.json";
import { readCms, writeCms } from "@/lib/cms";
import { SECTIONS, type SectionId, type Site } from "@/lib/types";

/** Satu dokumen JSON di Supabase Storage. Seed dari data/site.json hanya
 *  dipakai sebagai default untuk bagian yang belum pernah disimpan — file di
 *  disk tidak bisa ditulis di Vercel, jadi sumber kebenarannya object storage. */
const file = "site/site.json";

const seedSite = seed as Site;

function stored(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function getSite(): Promise<Site> {
  "use cache";
  cacheTag("site");
  cacheLife("max");
  const site: Site = { ...seedSite };
  try {
    const saved = stored(await readCms<unknown>(file));
    for (const section of SECTIONS) {
      const id = section.id as SectionId;
      if (sameShape(seedSite[id], saved[id])) {
        Object.assign(site, { [id]: saved[id] });
      }
    }
  } catch {
    // Storage sedang tidak bisa dihubungi: halaman tetap tampil dengan seed.
  }
  return site;
}

function sameShape(template: unknown, value: unknown): boolean {
  if (typeof template === "string") return typeof value === "string";
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return false;
    const sample = template[0];
    if (sample === undefined) return value.length === 0;
    return value.every((item) => sameShape(sample, item));
  }
  if (template && typeof template === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const expected = template as Record<string, unknown>;
    const actual = value as Record<string, unknown>;
    const keys = Object.keys(expected);
    if (keys.length !== Object.keys(actual).length) return false;
    return keys.every((key) => key in actual && sameShape(expected[key], actual[key]));
  }
  return false;
}

function countStrings(value: unknown): { total: number; filled: number } {
  if (typeof value === "string") return { total: 1, filled: value.trim() ? 1 : 0 };
  if (Array.isArray(value)) {
    return value.reduce(
      (sum, item) => {
        const next = countStrings(item);
        return { total: sum.total + next.total, filled: sum.filled + next.filled };
      },
      { total: 0, filled: 0 },
    );
  }
  if (value && typeof value === "object") {
    return Object.values(value).reduce(
      (sum, item) => {
        const next = countStrings(item);
        return { total: sum.total + next.total, filled: sum.filled + next.filled };
      },
      { total: 0, filled: 0 },
    );
  }
  return { total: 0, filled: 0 };
}

/** How much of each landing-page section is actually filled in. */
export function sectionStatus(site: Site) {
  return SECTIONS.map((section) => {
    const { total, filled } = countStrings(site[section.id as SectionId]);
    return {
      id: section.id,
      label: section.label,
      hint: section.hint,
      total,
      filled,
      empty: total - filled,
      complete: total > 0 && filled === total,
    };
  });
}

export async function saveSection(id: string, value: unknown) {
  const section = SECTIONS.find((item) => item.id === id);
  if (!section) return { ok: false as const, error: "Bagian tidak dikenal." };
  const template = seedSite[section.id as SectionId];
  if (!sameShape(template, value)) {
    return { ok: false as const, error: "Format konten tidak sesuai. Muat ulang halaman lalu coba lagi." };
  }
  try {
    const current = stored(await readCms<unknown>(file));
    await writeCms(file, { ...current, [section.id]: value });
  } catch (error) {
    console.error("[cms] storage error", error instanceof Error ? error.message : error);
    return { ok: false as const, error: "Konten gagal disimpan ke server. Coba lagi beberapa saat." };
  }
  return { ok: true as const };
}
