import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import seed from "@/data/site.json";
import { SECTIONS, type SectionId, type Site } from "@/lib/types";

const file = path.join(process.cwd(), "data", "site.json");

export async function getSite(): Promise<Site> {
  "use cache";
  cacheTag("site");
  cacheLife("max");
  try {
    return JSON.parse(await readFile(file, "utf8")) as Site;
  } catch {
    return seed as Site;
  }
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
  const template = (seed as Site)[section.id as SectionId];
  if (!sameShape(template, value)) {
    return { ok: false as const, error: "Format konten tidak sesuai. Muat ulang halaman lalu coba lagi." };
  }
  const site = JSON.parse(await readFile(file, "utf8")) as Site;
  const next = { ...site, [section.id]: value } as Site;
  await writeFile(file, JSON.stringify(next, null, 2) + "\n");
  return { ok: true as const };
}
