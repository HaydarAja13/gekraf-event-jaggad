import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { normalizeReferralCode } from "@/lib/referral";
import { makeTicketNo, type OrderStatus } from "@/lib/slots";

export type PayAccount = {
  id: string;
  bank: string;
  name: string;
  number: string;
};

export type ReferralCode = {
  id: string;
  name: string;
  code: string;
  discountAmount: number;
};

export type Order = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  institution: string;
  jobTitle: string;
  address: string;
  plan: string;
  amount: string;
  accountId: string;
  proofFile: string;
  status: OrderStatus;
  ticketNo: string | null;
  createdAt: string;
  referralCodeId: string | null;
  referralName: string | null;
  referralCode: string | null;
  discountAmount: number;
};

type AccountRow = {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
};

type OrderRow = {
  id: number;
  full_name: string;
  email: string;
  whatsapp: string;
  institution: string;
  job_title: string;
  address: string;
  plan_name: string;
  amount: string;
  payment_account_id: number;
  proof_path: string;
  status: OrderStatus;
  ticket_no: string | null;
  created_at: string;
  referral_code_id: number | null;
  referral_name: string | null;
  referral_code: string | null;
  discount_amount: number | null;
};

type ReferralRow = {
  id: number;
  name: string;
  code: string;
  discount_amount: number;
};

const BUCKET = "proofs";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_SECRET_KEY belum diisi");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapAccount(row: AccountRow): PayAccount {
  return { id: String(row.id), bank: row.bank_name, name: row.account_name, number: row.account_number };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: String(row.id),
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    institution: row.institution,
    jobTitle: row.job_title,
    address: row.address,
    plan: row.plan_name,
    amount: row.amount,
    accountId: String(row.payment_account_id),
    proofFile: row.proof_path,
    status: row.status,
    ticketNo: row.ticket_no,
    createdAt: row.created_at,
    referralCodeId: row.referral_code_id == null ? null : String(row.referral_code_id),
    referralName: row.referral_name,
    referralCode: row.referral_code,
    discountAmount: row.discount_amount ?? 0,
  };
}

function mapReferral(row: ReferralRow): ReferralCode {
  return {
    id: String(row.id),
    name: row.name,
    code: row.code,
    discountAmount: row.discount_amount,
  };
}

export async function listSales() {
  await connection();
  const client = db();
  const [accounts, orders, referrals] = await Promise.all([
    client.from("payment_accounts").select("id, bank_name, account_name, account_number").order("id"),
    client.from("orders").select("*").order("created_at", { ascending: false }),
    client.from("referral_codes").select("id, name, code, discount_amount").order("id"),
  ]);
  if (accounts.error) throw new Error(accounts.error.message);
  if (orders.error) throw new Error(orders.error.message);
  if (referrals.error) throw new Error(referrals.error.message);
  return {
    accounts: (accounts.data as AccountRow[]).map(mapAccount),
    orders: (orders.data as OrderRow[]).map(mapOrder),
    referrals: (referrals.data as ReferralRow[]).map(mapReferral),
  };
}

export async function findReferral(code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return null;
  const { data, error } = await db()
    .from("referral_codes")
    .select("id, name, code, discount_amount")
    .eq("code", normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapReferral(data as ReferralRow) : null;
}

export async function takenByPlan() {
  const sales = await listSales();
  const taken: Record<string, number> = {};
  for (const order of sales.orders) {
    if (order.status === "rejected") continue;
    taken[order.plan] = (taken[order.plan] ?? 0) + 1;
  }
  return taken;
}

export async function createOrder(
  input: Omit<
    Order,
    "id" | "status" | "ticketNo" | "createdAt" | "referralCodeId" | "referralName" | "referralCode" | "discountAmount"
  > & {
    plans: { name: string; slots: string }[];
    referralCode: string;
  },
) {
  const { error } = await db().rpc("place_order", {
    full_name: input.fullName,
    email: input.email,
    whatsapp: input.whatsapp,
    institution: input.institution,
    job_title: input.jobTitle,
    address: input.address,
    plan_name: input.plan,
    amount: input.amount,
    payment_account_id: Number(input.accountId),
    proof_path: input.proofFile,
    plans: input.plans.map((plan) => ({
      name: plan.name,
      slots: Number.parseInt(plan.slots, 10),
    })),
    referral_code: input.referralCode,
  });
  if (!error) return { ok: true as const };
  if (error.message.includes("referral")) return { ok: false as const, error: "referral" };
  if (error.message.includes("account")) return { ok: false as const, error: "account" };
  if (error.message.includes("locked")) return { ok: false as const, error: "locked" };
  if (error.message.includes("slot") || error.message.includes("plan")) {
    return { ok: false as const, error: "slot" };
  }
  return { ok: false as const, error: "fields" };
}

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  institution: string;
  jobTitle: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
};

export async function listCustomers() {
  await connection();
  const client = db();
  const [customers, orders] = await Promise.all([
    client.from("customers").select("*").order("updated_at", { ascending: false }),
    client.from("orders").select("*").order("created_at", { ascending: false }),
  ]);
  if (customers.error) throw new Error(customers.error.message);
  if (orders.error) throw new Error(orders.error.message);
  const byCustomer = new Map<string, Order[]>();
  for (const row of orders.data as (OrderRow & { customer_id: number | null })[]) {
    const order = mapOrder(row);
    const key = row.customer_id != null ? String(row.customer_id) : `email:${order.email}`;
    const list = byCustomer.get(key) ?? [];
    list.push(order);
    byCustomer.set(key, list);
  }
  return (customers.data as {
    id: number;
    full_name: string;
    email: string;
    whatsapp: string;
    institution: string;
    job_title: string;
    address: string;
    created_at: string;
    updated_at: string;
  }[]).map((row) => ({
    id: String(row.id),
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    institution: row.institution,
    jobTitle: row.job_title,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    orders: byCustomer.get(String(row.id)) ?? [],
  })) satisfies Customer[];
}

export async function approveOrder(
  id: string,
  send: (order: Order, ticketNo: string) => Promise<{ ok: true } | { ok: false; error: string }>,
) {
  const client = db();
  const { data, error } = await client.from("orders").select("*").eq("id", Number(id)).maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  const row = data as OrderRow | null;
  if (!row || row.status !== "pending") {
    return { ok: false as const, error: "Transaksi ini sudah diproses." };
  }
  const ticketNo = makeTicketNo();
  const mailed = await send(mapOrder(row), ticketNo);
  if (!mailed.ok) return mailed;
  const saved = await client
    .from("orders")
    .update({ status: "approved", ticket_no: ticketNo })
    .eq("id", row.id)
    .eq("status", "pending");
  if (saved.error) return { ok: false as const, error: saved.error.message };
  return { ok: true as const, ticketNo };
}

export async function rejectOrder(id: string) {
  const { error } = await db()
    .from("orders")
    .update({ status: "rejected" })
    .eq("id", Number(id))
    .eq("status", "pending");
  return !error;
}

export async function addAccount(input: { bank: string; name: string; number: string }) {
  const { error } = await db().from("payment_accounts").insert({
    bank_name: input.bank,
    account_name: input.name,
    account_number: input.number,
  });
  if (error) throw new Error(error.message);
}

export async function updateAccount(input: { id: string; bank: string; name: string; number: string }) {
  const { error } = await db()
    .from("payment_accounts")
    .update({
      bank_name: input.bank,
      account_name: input.name,
      account_number: input.number,
    })
    .eq("id", Number(input.id));
  if (error) throw new Error(error.message);
}

export async function addReferral(input: { name: string; code: string; discountAmount: number }) {
  const { error } = await db().from("referral_codes").insert({
    name: input.name,
    code: input.code,
    discount_amount: input.discountAmount,
  });
  if (!error) return { ok: true as const };
  if (error.code === "23505") return { ok: false as const, error: "taken" as const };
  throw new Error(error.message);
}

export async function updateReferral(input: { id: string; name: string; code: string; discountAmount: number }) {
  const { error } = await db()
    .from("referral_codes")
    .update({
      name: input.name,
      code: input.code,
      discount_amount: input.discountAmount,
    })
    .eq("id", Number(input.id));
  if (!error) return { ok: true as const };
  if (error.code === "23505") return { ok: false as const, error: "taken" as const };
  throw new Error(error.message);
}

export async function removeReferral(id: string) {
  const client = db();
  const used = await client
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("referral_code_id", Number(id));
  if ((used.count ?? 0) > 0) return { ok: false as const, error: "used" as const };
  const { error } = await client.from("referral_codes").delete().eq("id", Number(id));
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function removeAccount(id: string) {
  const client = db();
  const used = await client
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("payment_account_id", Number(id));
  if ((used.count ?? 0) > 0) return { ok: false as const, error: "used" };
  const { error } = await client.from("payment_accounts").delete().eq("id", Number(id));
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function orderByTicket(ticketNo: string) {
  await connection();
  const { data, error } = await db()
    .from("orders")
    .select("*")
    .eq("ticket_no", ticketNo)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !data) return null;
  return mapOrder(data as OrderRow);
}

export async function orderById(id: string) {
  const { data, error } = await db().from("orders").select("*").eq("id", Number(id)).maybeSingle();
  if (error || !data) return null;
  return mapOrder(data as OrderRow);
}

function imageExt(type: string) {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}

async function proofs() {
  const client = db();
  const existing = await client.storage.getBucket(BUCKET);
  if (!existing.data) {
    const created = await client.storage.createBucket(BUCKET, { public: false });
    if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
      throw new Error(created.error.message);
    }
  }
  return client.storage.from(BUCKET);
}

export async function uploadProof(file: File) {
  if (!file.type.startsWith("image/") || file.size === 0) return { ok: false as const, error: "File harus gambar." };
  if (file.size > 4 * 1024 * 1024) return { ok: false as const, error: "Gambar maksimal 4 MB." };
  const name = `${crypto.randomUUID()}${imageExt(file.type)}`;
  const bucket = await proofs();
  const { error } = await bucket.upload(name, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, name };
}

export async function removeProof(name: string) {
  await db().storage.from(BUCKET).remove([name]);
}

export async function readProof(name: string) {
  const { data, error } = await db().storage.from(BUCKET).download(name);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}
