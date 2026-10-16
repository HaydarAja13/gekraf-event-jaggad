"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin, login, logout } from "@/lib/auth";
import { sendTicketEmail } from "@/lib/mail";
import {
  addAccount,
  approveOrder,
  createOrder,
  rejectOrder,
  removeAccount,
  removeProof,
  updateAccount,
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

export async function checkoutAction(formData: FormData) {
  const planName = String(formData.get("plan") ?? "");
  const back = `/checkout?plan=${encodeURIComponent(planName)}`;
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
  const proof = formData.get("proof");
  if (!fullName || !email.includes("@") || !whatsapp || !institution || !jobTitle || !address) {
    redirect(`${back}&error=fields`);
  }
  if (!(proof instanceof File)) redirect(`${back}&error=file`);

  const saved = await uploadProof(proof);
  if (!saved.ok) redirect(`${back}&error=file`);

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
  });
  if (!result.ok) {
    await removeProof(saved.name);
    redirect(`${back}&error=${result.error}`);
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
