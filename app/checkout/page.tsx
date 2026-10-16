import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "../components/Navbar";
import { listSales } from "@/lib/sales";
import { planState } from "@/lib/slots";
import { getSite } from "@/lib/site";
import { CheckoutForm } from "./form";

const errors: Record<string, string> = {
  fields: "Lengkapi semua isian. Email harus valid.",
  file: "Unggah bukti pembayaran berupa gambar, maksimal 4 MB.",
  account: "Pilih rekening pembayaran.",
  slot: "Slot paket ini sudah habis.",
  locked: "Paket ini belum dibuka. Habiskan slot paket sebelumnya dulu.",
};

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8 text-center">Memuat checkout…</p>}>
      <Checkout searchParams={searchParams} />
    </Suspense>
  );
}

async function Checkout({ searchParams }: { searchParams: Promise<{ plan?: string; error?: string }> }) {
  const query = await searchParams;
  const site = await getSite();
  const plan = site.pricing.plans.find((item) => item.name === query.plan);
  if (!plan) notFound();

  return (
    <>
      <Navbar content={site.navbar} />
      <main className="bg-[#f4fafc] px-4 py-10">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="text-[28px] font-extrabold tracking-tight">Checkout</h1>
          {query.error && errors[query.error] && (
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-[15px] text-[#9a3412]">{errors[query.error]}</p>
          )}
          <Suspense fallback={<p className="mt-6 rounded-3xl bg-white p-6 text-[16px]">Memuat form…</p>}>
            <CheckoutBody plan={plan} plans={site.pricing.plans} />
          </Suspense>
        </div>
      </main>
    </>
  );
}

async function CheckoutBody({
  plan,
  plans,
}: {
  plan: { name: string; price: string; slots: string };
  plans: { name: string; slots: string }[];
}) {
  const db = await listSales();
  const taken: Record<string, number> = {};
  for (const order of db.orders) {
    if (order.status === "rejected") continue;
    taken[order.plan] = (taken[order.plan] ?? 0) + 1;
  }
  const index = plans.findIndex((item) => item.name === plan.name);
  const state = planState(plans, taken, index);
  if (state.locked) {
    return <p className="mt-6 rounded-3xl bg-white p-6 text-[16px]">Paket {plan.name} belum dibuka. Habiskan slot paket sebelumnya dulu.</p>;
  }
  if (!state.open) {
    return <p className="mt-6 rounded-3xl bg-white p-6 text-[16px]">Slot {plan.name} sudah habis.</p>;
  }
  if (db.accounts.length === 0) {
    return <p className="mt-6 rounded-3xl bg-white p-6 text-[16px]">Rekening pembayaran belum diatur admin.</p>;
  }
  return (
    <div className="mt-6">
      <CheckoutForm plan={plan.name} amount={plan.price} accounts={db.accounts} />
    </div>
  );
}
