import Link from "next/link";
import Navbar from "../../components/Navbar";
import { getSite } from "@/lib/site";

export default async function SentPage() {
  const site = await getSite();
  return (
    <>
      <Navbar content={site.navbar} />
      <main className="bg-[#f4fafc] px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-7">
          <h1 className="text-[28px] font-extrabold tracking-tight">Pendaftaran terkirim</h1>
          <p className="mt-3 text-[16px] leading-relaxed">
            Bukti pembayaran sudah masuk. Tiket dan nomor tiket dikirim ke email setelah admin mengonfirmasi pembayaran.
          </p>
          <Link href="/" className="mt-6 inline-block text-[15px] font-bold text-gekraf-cyan">
            Kembali ke beranda
          </Link>
        </div>
      </main>
    </>
  );
}
