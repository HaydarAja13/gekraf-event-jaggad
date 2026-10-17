"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin, login, logout } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/mail";
import { formatIdr, normalizeReferralCode, parseIdr, payableAmount, validReferralCode } from "@/lib/referral";
import {
  addAccount,
  addReferral,
  approveOrder,
  createOrder,
  findReferral,
  rejectOrder,
  removeAccount,
  removeProof,
  removeReferral,
  updateAccount,
  updateReferral,
  uploadProof,
} from "@/lib/sales";
import { getSite, saveSection } from "@/lib/site";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const ok = await login(username, password);
  if (!ok) redirect("/login?error=1");
  redirect("/dashboard");
}

export async function logoutAction() {
  await logout();
}

export async function saveSectionAction(formData: FormData) {
  const admin = await getAdmin();
  const id = String(formData.get("section") ?? "");
  if (!admin) redirect("/login");
  let value: unknown;
  try {
    value = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    redirect(`/dashboard/${id}?error=1`);
  }
  const result = await saveSection(id, value);
  if (!result.ok) redirect(`/dashboard/${id}?error=1`);
  updateTag("site");
  redirect(`/dashboard/${id}?saved=1`);
}

function imageExt(type: string) {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}

async function saveImage(file: File, dir: string) {
  if (!file.type.startsWith("image/") || file.size === 0) return { ok: false as const, error: "File harus gambar." };
  if (file.size > 4 * 1024 * 1024) return { ok: false as const, error: "Gambar maksimal 4 MB." };
  const name = `${crypto.randomUUID()}${imageExt(file.type)}`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { ok: true as const, name };
}

export async function uploadImageAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) return { ok: false as const, error: "Login dulu." };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "Pilih gambar." };
  const saved = await saveImage(file, path.join(process.cwd(), "public/uploads/cms"));
  if (!saved.ok) return saved;
  return { ok: true as const, src: `/uploads/cms/${saved.name}` };
}

export type CheckoutState = {
  message: string;
  fieldErrors: Record<string, string>;
  backToPlans?: boolean;
} | null;

const PLAN_ERRORS: Record<string, { message: string; backToPlans?: boolean }> = {
  account: {
    message: "Rekening pembayaran ini sudah tidak tersedia. Muat ulang halaman ini lalu coba lagi.",
  },
  slot: {
    message: "Slot paket ini baru saja habis. Pilih paket lain untuk melanjutkan.",
    backToPlans: true,
  },
  locked: {
    message: "Paket ini belum dibuka. Habiskan slot paket sebelumnya dulu.",
    backToPlans: true,
  },
};

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Form state for the checkout ticket: errors come back as state, never as a
 *  redirect, so nobody loses a filled form to a typo. */
export async function checkoutAction(
  _state: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const planName = String(formData.get("plan") ?? "");
  const site = await getSite();
  const plan = site.pricing.plans.find((item) => item.name === planName);
  if (!plan) redirect("/#harga");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const accountId = String(formData.get("accountId") ?? "");
  const referral = normalizeReferralCode(String(formData.get("referral") ?? ""));
  const proof = formData.get("proof");

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.fullName = "Tulis nama lengkap sesuai identitas.";
  if (!email) fieldErrors.email = "Email belum diisi.";
  else if (!EMAIL_SHAPE.test(email)) {
    fieldErrors.email = "Format email belum benar — contoh: nama@perusahaan.co.id";
  }
  const digits = whatsapp.replace(/\D/g, "");
  if (!whatsapp) fieldErrors.whatsapp = "Nomor WhatsApp belum diisi.";
  else if (digits.length < 9) fieldErrors.whatsapp = "Nomor WhatsApp terlalu pendek.";
  if (!institution) fieldErrors.institution = "Instansi belum diisi.";
  if (!jobTitle) fieldErrors.jobTitle = "Jabatan belum diisi.";
  if (!address) fieldErrors.address = "Alamat belum diisi.";
  if (!accountId) fieldErrors.accountId = "Pilih rekening pembayaran.";
  if (referral && !(await findReferral(referral))) {
    fieldErrors.referral = "Kode referral tidak ditemukan.";
  }
  if (!(proof instanceof File) || proof.size === 0) {
    fieldErrors.proof = "Unggah bukti transfer berupa gambar.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: "Pendaftaran belum terkirim. Periksa bagian yang ditandai di bawah.",
      fieldErrors,
    };
  }

  const saved = await uploadProof(proof as File);
  if (!saved.ok) return { message: saved.error, fieldErrors: { proof: saved.error } };

  const result = await createOrder({
    fullName,
    email,
    whatsapp,
    institution,
    jobTitle,
    address,
    plan: plan.name,
    amount: plan.price,
    accountId,
    proofFile: saved.name,
    plans: site.pricing.plans,
    referralCode: referral,
  });
  if (!result.ok) {
    await removeProof(saved.name);
    if (result.error === "referral") {
      return {
        message: "Kode referral tidak ditemukan.",
        fieldErrors: { referral: "Kode referral tidak ditemukan." },
      };
    }
    const planError = PLAN_ERRORS[result.error];
    if (planError) {
      return { message: planError.message, fieldErrors: {}, backToPlans: planError.backToPlans };
    }
    return {
      message: "Pendaftaran belum bisa diproses. Periksa kembali isian Anda lalu kirim ulang.",
      fieldErrors: {},
    };
  }
  redirect("/checkout/terkirim");
}

export async function approveOrderAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const site = await getSite();
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const origin = `${proto}://${host}`;
  const result = await approveOrder(id, (order, ticketNo) =>
    sendTicketEmail({
      order,
      ticketNo,
      pageUrl: `${origin}/tiket/${ticketNo}`,
      downloadUrl: `${origin}/tiket/${ticketNo}/unduh`,
      when: `${site.hero.date}, ${site.hero.time}`,
      where: `${site.hero.venue}, ${site.hero.city}`,
    }),
  );
  if (!result.ok) redirect(`/dashboard/transaksi?error=${encodeURIComponent(result.error)}`);
  redirect("/dashboard/transaksi?saved=1");
}

export async function rejectOrderAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  await rejectOrder(String(formData.get("id") ?? ""));
  redirect("/dashboard/transaksi");
}

export async function previewReferralAction(planName: string, code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return { ok: true as const, empty: true as const };
  const site = await getSite();
  const plan = site.pricing.plans.find((item) => item.name === planName);
  if (!plan) return { ok: false as const, error: "Paket tidak ditemukan." };
  const found = await findReferral(normalized);
  if (!found) return { ok: false as const, error: "Kode referral tidak ditemukan." };
  const list = parseIdr(plan.price);
  const discount = Math.min(found.discountAmount, list);
  const payable = payableAmount(list, found.discountAmount);
  return {
    ok: true as const,
    empty: false as const,
    name: found.name,
    code: found.code,
    discount,
    payable: formatIdr(payable),
    discountLabel: formatIdr(discount),
  };
}

function referralInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const code = normalizeReferralCode(String(formData.get("code") ?? ""));
  const discountAmount = parseIdr(String(formData.get("discount") ?? ""));
  return { name, code, discountAmount };
}

export async function addReferralAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const input = referralInput(formData);
  if (!input.name || !validReferralCode(input.code) || input.discountAmount <= 0) {
    redirect("/dashboard/referral?error=1");
  }
  const saved = await addReferral(input);
  if (!saved.ok) redirect("/dashboard/referral?error=taken");
  redirect("/dashboard/referral?saved=1");
}

export async function updateReferralAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const input = referralInput(formData);
  if (!id || !input.name || !validReferralCode(input.code) || input.discountAmount <= 0) {
    redirect(`/dashboard/referral?edit=${encodeURIComponent(id)}&error=1`);
  }
  const saved = await updateReferral({ id, ...input });
  if (!saved.ok) redirect(`/dashboard/referral?edit=${encodeURIComponent(id)}&error=taken`);
  redirect("/dashboard/referral?saved=1");
}

export async function removeReferralAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const result = await removeReferral(String(formData.get("id") ?? ""));
  if (!result.ok && result.error === "used") redirect("/dashboard/referral?error=used");
  if (!result.ok) redirect(`/dashboard/referral?error=${encodeURIComponent(result.error)}`);
  redirect("/dashboard/referral?saved=1");
}

export async function addAccountAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const bank = String(formData.get("bank") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  if (!bank || !name || !number) redirect("/dashboard/pembayaran?error=1");
  await addAccount({ bank, name, number });
  redirect("/dashboard/pembayaran?saved=1");
}

export async function updateAccountAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const bank = String(formData.get("bank") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  if (!id || !bank || !name || !number) redirect(`/dashboard/pembayaran?edit=${encodeURIComponent(id)}&error=1`);
  await updateAccount({ id, bank, name, number });
  redirect("/dashboard/pembayaran?saved=1");
}

export async function removeAccountAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const result = await removeAccount(String(formData.get("id") ?? ""));
  if (!result.ok && result.error === "used") {
    redirect("/dashboard/pembayaran?error=used");
  }
  redirect("/dashboard/pembayaran?saved=1");
}
