"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin, login, logout } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/mail";
import { formatIdr, normalizeReferralCode, parseIdr, payableAmount, validReferralCode } from "@/lib/referral";
import { makeTicketNo } from "@/lib/slots";
import {
  addAccount,
  addReferral,
  approveOrder,
  checkInByTicket,
  createOrder,
  findReferral,
  markAttendance,
  orderById,
  rejectOrder,
  removeAccount,
  removeProof,
  removeReferral,
  undoAttendance,
  updateAccount,
  updateReferral,
  uploadProof,
} from "@/lib/sales";
import { readMetaForm, saveMeta, sendMetaTest, trackMeta, verifyMeta } from "@/lib/meta";
import { readSmtpForm, saveSmtp, validEmail, verifySmtp } from "@/lib/smtp";
import { getSite, saveSection } from "@/lib/site";
import { getTicketSettings, saveTicketSettings } from "@/lib/ticket-settings";

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

function imageExt(type: string, name = "") {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  const fromName = /\.(png|webp|gif|jpe?g)$/i.exec(name)?.[0].toLowerCase();
  if (fromName) return fromName === ".jpeg" ? ".jpg" : fromName;
  return ".jpg";
}

/** Some phones and download managers report an empty or generic MIME type for a
 *  perfectly fine JPEG; fall back to the file name before rejecting it. */
function isImageFile(file: File) {
  if (file.type.startsWith("image/")) return true;
  const generic = file.type === "" || file.type === "application/octet-stream";
  return generic && /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp)$/i.test(file.name);
}

async function saveImage(file: File, dir: string) {
  if (!isImageFile(file) || file.size === 0) return { ok: false as const, error: "File harus gambar." };
  if (file.size > 4 * 1024 * 1024) return { ok: false as const, error: "Gambar maksimal 4 MB." };
  const name = `${crypto.randomUUID()}${imageExt(file.type, file.name)}`;
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
    message: "Paket ini belum bisa dipilih. Pilih paket lain untuk melanjutkan.",
    backToPlans: true,
  },
  locked: {
    message: "Paket ini belum dibuka. Pilih paket yang sedang dibuka.",
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
  if (result.ticketNo) {
    const browser = await metaBrowser("/checkout");
    await trackMeta({
      eventName: "Lead",
      eventId: result.ticketNo,
      email,
      phone: whatsapp,
      name: fullName,
      value: parseIdr(plan.price),
      contentName: plan.name,
      ...browser,
    });
  }
  const tiket = result.ticketNo ? `?tiket=${encodeURIComponent(result.ticketNo)}` : "";
  redirect(`/checkout/terkirim${tiket}`);
}

async function metaBrowser(path: string) {
  const [jar, h, origin] = await Promise.all([cookies(), headers(), requestOrigin()]);
  return {
    sourceUrl: `${origin}${path}`,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
    userAgent: h.get("user-agent") ?? "",
    fbp: jar.get("_fbp")?.value ?? "",
    fbc: jar.get("_fbc")?.value ?? "",
  };
}

async function requestOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  return `${proto}://${host}`;
}

async function eventMail(input: { fullName: string; plan: string; amount: string; ticketNo: string; to: string }) {
  const [site, ticketSettings] = await Promise.all([getSite(), getTicketSettings()]);
  const origin = await requestOrigin();
  const event =
    ticketSettings.eventTitle ||
    [site.hero.titleLine1, site.hero.titleGold, site.hero.titleRest]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  const pamphletUrl = ticketSettings.pamphletUrl || "/pamflet.jpeg";

  return sendTicketEmail({
    ...input,
    pageUrl: `${origin}/tiket/${input.ticketNo}`,
    downloadUrl: `${origin}/tiket/${input.ticketNo}/unduh`,
    when: `${site.hero.date}, ${site.hero.time}`,
    where: `${site.hero.venue}, ${site.hero.city}`,
    event: event || site.navbar.brand,
    badge: ticketSettings.badge || site.hero.badge,
    pamphletUrl,
    subtitle: ticketSettings.eventSubtitle,
    greeting: ticketSettings.greeting,
    instructions: ticketSettings.instructions,
    supportWhatsapp: ticketSettings.supportWhatsapp,
    supportLabel: ticketSettings.supportLabel,
    organizer: ticketSettings.organizer,
  });
}

export async function saveTicketSettingsAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  let pamphletUrl = String(formData.get("pamphletUrl") ?? "").trim();
  const file = formData.get("pamphletFile");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file, path.join(process.cwd(), "public/uploads/cms"));
    if (!saved.ok) {
      redirect(`/dashboard/tiket?error=${encodeURIComponent(saved.error)}`);
    }
    pamphletUrl = `/uploads/cms/${saved.name}`;
  }

  const rawInstructions = String(formData.get("instructions") ?? "");
  const instructions = rawInstructions
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  await saveTicketSettings({
    eventTitle: String(formData.get("eventTitle") ?? "").trim(),
    eventSubtitle: String(formData.get("eventSubtitle") ?? "").trim(),
    badge: String(formData.get("badge") ?? "").trim(),
    pamphletUrl: pamphletUrl || "/pamflet.jpeg",
    greeting: String(formData.get("greeting") ?? "").trim(),
    instructions: instructions.length > 0 ? instructions : undefined,
    supportWhatsapp: String(formData.get("supportWhatsapp") ?? "").trim(),
    supportLabel: String(formData.get("supportLabel") ?? "").trim(),
    organizer: String(formData.get("organizer") ?? "").trim(),
  });

  updateTag("ticket-settings");
  redirect("/dashboard/tiket?saved=1");
}

export async function sendTestTicketEmailAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const to = String(formData.get("to") ?? "").trim();
  if (!validEmail(to)) {
    redirect(`/dashboard/tiket?error=${encodeURIComponent("Email penerima belum benar.")}`);
  }
  const site = await getSite();
  const plan = site.pricing.plans[0];
  const sent = await eventMail({
    fullName: "Peserta VIP (Uji Coba)",
    plan: plan?.name ?? "VIP Pass",
    amount: plan?.price ?? "Rp 999.000",
    ticketNo: makeTicketNo(),
    to,
  });
  if (!sent.ok) {
    redirect(`/dashboard/tiket?error=${encodeURIComponent(sent.error)}`);
  }
  redirect("/dashboard/tiket?tested=1");
}

function pengirimanError(message: string): never {
  redirect(`/dashboard/pengiriman?error=${encodeURIComponent(message)}`);
}

export async function approveOrderAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const result = await approveOrder(id, (order, ticketNo) =>
    eventMail({
      fullName: order.fullName,
      plan: order.plan,
      amount: order.amount,
      ticketNo,
      to: order.email,
    }),
  );
  if (!result.ok) redirect(`/dashboard/transaksi?error=${encodeURIComponent(result.error)}`);
  if (result.ticketNo) {
    const order = await orderById(id);
    if (order) {
      const origin = await requestOrigin();
      await trackMeta({
        eventName: "Purchase",
        eventId: `purchase-${result.ticketNo}`,
        sourceUrl: `${origin}/checkout`,
        email: order.email,
        phone: order.whatsapp,
        name: order.fullName,
        value: parseIdr(order.amount),
        contentName: order.plan,
      });
    }
  }
  redirect("/dashboard/transaksi?saved=1");
}

function metaError(message: string): never {
  redirect(`/dashboard/meta?error=${encodeURIComponent(message)}`);
}

export async function saveMetaAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const parsed = readMetaForm(formData);
  if (!parsed.ok) metaError(parsed.error);
  const saved = await saveMeta(parsed.value);
  if (!saved.ok) metaError(saved.error);
  if (!parsed.value.enabled) redirect("/dashboard/meta?saved=1");
  const check = await verifyMeta();
  if (!check.ok) {
    redirect(`/dashboard/meta?warn=${encodeURIComponent(`Tersimpan, tetapi Meta menolak: ${check.error}`)}`);
  }
  redirect(`/dashboard/meta?saved=1&pixel=${encodeURIComponent(check.name)}`);
}

export async function sendMetaTestAction() {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const sent = await sendMetaTest(`${await requestOrigin()}/`);
  if (!sent.ok) metaError(sent.error);
  redirect("/dashboard/meta?tested=1");
}

export async function saveSmtpAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const parsed = readSmtpForm(formData);
  if (!parsed.ok) pengirimanError(parsed.error);
  const saved = await saveSmtp(parsed.value);
  if (!saved.ok) pengirimanError(saved.error);
  const check = await verifySmtp();
  if (!check.ok) {
    redirect(`/dashboard/pengiriman?warn=${encodeURIComponent(`Tersimpan, tetapi koneksi SMTP gagal: ${check.error}`)}`);
  }
  redirect("/dashboard/pengiriman?saved=1");
}

export async function sendCustomTicketAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const to = String(formData.get("to") ?? "").trim();
  if (!validEmail(to)) pengirimanError("Email penerima tiket belum benar.");
  const order = await orderById(String(formData.get("orderId") ?? ""));
  if (!order || order.status !== "approved" || !order.ticketNo) {
    pengirimanError("Pilih tiket yang sudah di-ACC.");
  }
  const sent = await eventMail({
    fullName: order.fullName,
    plan: order.plan,
    amount: order.amount,
    ticketNo: order.ticketNo,
    to,
  });
  if (!sent.ok) pengirimanError(sent.error);
  redirect("/dashboard/pengiriman?sent=1");
}

export async function sendSmtpProbeAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const to = String(formData.get("to") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) pengirimanError("Nama pada email tiket wajib diisi.");
  if (!validEmail(to)) pengirimanError("Email penerima belum benar.");
  const site = await getSite();
  const planName = String(formData.get("plan") ?? "");
  const plan = site.pricing.plans.find((item) => item.name === planName) ?? site.pricing.plans[0];
  const sent = await eventMail({
    fullName,
    plan: plan?.name ?? "Tiket",
    amount: plan?.price ?? "",
    ticketNo: makeTicketNo(),
    to,
  });
  if (!sent.ok) pengirimanError(sent.error);
  redirect("/dashboard/pengiriman?probe=1");
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

/* ---------- attendance (absensi) ---------- */

/** Dipanggil scanner QR di klien. Mengembalikan objek hasil, bukan redirect,
 *  supaya komponen kamera bisa memberi umpan balik seketika (nama + nada). */
export type ScanCheckInResult =
  | { ok: true; name: string; ticketNo: string; plan: string; already: boolean }
  | { ok: false; error: string };

const SCAN_ERRORS: Record<string, string> = {
  invalid: "QR tidak dikenali. Pastikan memindai tiket peserta.",
  notfound: "Nomor tiket tidak ditemukan di sistem.",
  notapproved: "Pembayaran peserta ini belum di-ACC. Tiket belum berlaku.",
};

export async function scanCheckInAction(payload: string): Promise<ScanCheckInResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Sesi admin berakhir. Muat ulang halaman." };
  const result = await checkInByTicket(String(payload ?? ""), admin.username);
  if (!result.ok) return { ok: false, error: SCAN_ERRORS[result.error] ?? SCAN_ERRORS.invalid };
  return { ok: true, name: result.name, ticketNo: result.ticketNo, plan: result.plan, already: result.already };
}

/** Susun ulang ke halaman absensi dengan filter yang sedang aktif. */
function absensiBack(formData: FormData, param: string, value: string) {
  const query = String(formData.get("back") ?? "").replace(/^\?/, "").trim();
  return `/dashboard/absensi${query ? `?${query}&` : "?"}${param}=${encodeURIComponent(value)}`;
}

/** Tandai hadir manual dari baris tabel (tanpa scan). */
export async function markPresentAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(absensiBack(formData, "error", "Peserta tidak ditemukan."));
  const marked = await markAttendance(id, admin.username);
  if (!marked) {
    redirect(absensiBack(formData, "error", "Peserta ini sudah hadir atau tiketnya belum berlaku."));
  }
  redirect(absensiBack(formData, "saved", "hadir"));
}

/** Batalkan kehadiran (salah scan / koreksi manual). */
export async function undoAttendanceAction(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  await undoAttendance(String(formData.get("id") ?? ""));
  redirect(absensiBack(formData, "saved", "batal"));
}
