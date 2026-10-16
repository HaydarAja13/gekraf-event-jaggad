"use client";

import { useState } from "react";
import { ImagePick } from "@/app/components/ImagePick";
import { checkoutAction } from "@/lib/actions";
import type { PayAccount } from "@/lib/sales";

export function CheckoutForm({
  plan,
  amount,
  accounts,
}: {
  plan: string;
  amount: string;
  accounts: PayAccount[];
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
  const field = "mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[16px] outline-none focus-visible:border-gekraf-cyan";

  return (
    <form action={checkoutAction} className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <input type="hidden" name="plan" value={plan} />
      <p className="text-[14px] text-gekraf-muted">{plan}</p>
      <p className="mt-1 text-[28px] font-extrabold tracking-tight">{amount}</p>
      <div className="mt-5 grid gap-4">
        <label className="text-[14px] font-bold">Nama lengkap<input name="fullName" required autoComplete="name" className={field} /></label>
        <label className="text-[14px] font-bold">Email<input name="email" type="email" required autoComplete="email" className={field} /></label>
        <label className="text-[14px] font-bold">WhatsApp<input name="whatsapp" required inputMode="tel" autoComplete="tel" className={field} /></label>
        <label className="text-[14px] font-bold">Instansi<input name="institution" required className={field} /></label>
        <label className="text-[14px] font-bold">Jabatan<input name="jobTitle" required className={field} /></label>
        <label className="text-[14px] font-bold">Alamat<textarea name="address" required rows={3} className={field} /></label>
      </div>
      <fieldset className="mt-5">
        <legend className="text-[14px] font-bold">Metode pembayaran</legend>
        <div className="mt-2 flex flex-col gap-2">
          {accounts.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-[15px]">
              <input type="radio" name="accountId" value={item.id} checked={item.id === account?.id} onChange={() => setAccountId(item.id)} />
              {item.bank}
            </label>
          ))}
        </div>
        {account && (
          <div className="mt-3 rounded-2xl bg-[#f4fafc] p-4 text-[15px]">
            <p>Nama rekening</p>
            <p className="font-extrabold">{account.name}</p>
            <p className="mt-2">Nomor rekening</p>
            <p className="font-extrabold">{account.number}</p>
          </div>
        )}
      </fieldset>
      <div className="mt-5">
        <p className="text-[14px] font-bold">Bukti pembayaran</p>
        <ImagePick
          id="proof"
          name="proof"
          required
          label={preview ? "Ganti gambar" : "Pilih gambar"}
          fileName={fileName}
          onChange={(file) => {
            setFileName(file?.name ?? null);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        {preview && <img src={preview} alt="Pratinjau bukti pembayaran" className="mt-3 max-h-48 rounded-2xl object-contain" />}
      </div>
      <button className="mt-6 w-full rounded-full bg-gekraf-ink py-3 text-[16px] font-extrabold text-white">Kirim pendaftaran</button>
    </form>
  );
}
