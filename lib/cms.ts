import { createClient } from "@supabase/supabase-js";

/** CMS content lives in Supabase Storage, not on disk.
 *
 *  Vercel menjalankan function dari filesystem yang read-only (hanya /tmp yang
 *  bisa ditulis dan isinya hilang saat instance mati), jadi `writeFile` ke
 *  data/site.json dulu selalu gagal 500 di production — padahal jalan di lokal.
 *  Object storage bisa ditulis dari mana saja dan tetap ada setelah redeploy. */

const CONTENT_BUCKET = "cms-content";
const IMAGE_BUCKET = "cms";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_SECRET_KEY belum diisi");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function bucket(name: string, isPublic: boolean) {
  const client = db();
  const existing = await client.storage.getBucket(name);
  if (!existing.data) {
    const created = await client.storage.createBucket(name, { public: isPublic });
    if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
      throw new Error(created.error.message);
    }
  }
  return client.storage.from(name);
}

/** Read a JSON document. `null` means "never saved, use the defaults".
 *
 *  Dibaca lewat fetch langsung, bukan storage.download(): respons object yang
 *  sudah pernah dibaca bisa tersaji dari cache CDN Supabase walau object-nya
 *  baru ditimpa, sehingga CMS sempat menampilkan isi lama setelah disimpan.
 *  Cache-buster di query memaksa Supabase mengirim versi terbaru. */
export async function readCms<T>(path: string): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_SECRET_KEY belum diisi");
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `${url}/storage/v1/object/authenticated/${CONTENT_BUCKET}/${safePath}?t=${Date.now()}`,
    {
      headers: { Authorization: `Bearer ${key}`, apikey: key },
      cache: "no-store",
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    // Supabase membalas HTTP 400 dengan statusCode "404" untuk object yang
    // memang belum pernah disimpan. Itu bukan error — pakai default saja.
    const body = (await response.json().catch(() => null)) as
      | { statusCode?: string; error?: string }
      | null;
    if (body?.statusCode === "404" || body?.error === "not_found") return null;
    throw new Error(`Gagal membaca konten CMS (${response.status}).`);
  }
  return (await response.json()) as T;
}

export async function writeCms(path: string, value: unknown) {
  const store = await bucket(CONTENT_BUCKET, false);
  const { error } = await store.upload(path, JSON.stringify(value), {
    contentType: "application/json",
    cacheControl: "0",
    upsert: true,
  });
  if (error) throw new Error(error.message);
}

/** Upload an image and return its public URL. */
export async function uploadCmsImage(name: string, file: File) {
  const store = await bucket(IMAGE_BUCKET, true);
  const { error } = await store.upload(name, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return store.getPublicUrl(name).data.publicUrl;
}
