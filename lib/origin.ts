import { headers } from "next/headers";

/**
 * Alamat asal permintaan — mis. https://gekraf.jaggadacademy.id di produksi.
 * Semua tautan yang dibuat untuk email/pixel harus memakai ini agar otomatis
 * mengikuti domain yang sedang dipakai pengunjung (bukan localhost:3000).
 * Di Vercel, header x-forwarded-* selalu terisi; host "localhost"/"127.*"
 * hanya muncul saat pengembangan di laptop.
 */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const local = host.startsWith("localhost") || host.startsWith("127.");
  const proto = h.get("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}
