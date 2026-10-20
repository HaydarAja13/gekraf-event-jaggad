import { Suspense } from "react";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { getAdmin } from "@/lib/auth";
import { Flash } from "@/app/toast";
import { PendingButton } from "@/app/submit";

export const metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<LoginFrame error={false} />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginGate({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect("/dashboard");
  const { error } = await searchParams;
  return <LoginFrame error={error === "1"} />;
}

function LoginFrame({ error }: { error: boolean }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
      <section className="flex flex-col justify-between bg-gekraf-cyan px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
        <p className="text-[1.35rem] font-extrabold tracking-[-0.02em]">
          Business Skill Mastery
        </p>
        <div className="mt-10 max-w-[18rem] lg:mt-0">
          <h1 className="text-[2rem] leading-[1.12] font-extrabold lg:text-[2.6rem]">
            Sunting landing page dari satu tempat.
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-white/85">
            Setiap judul, harga, testimoni, dan tombol bisa diganti tanpa
            mengubah kode.
          </p>
        </div>
      </section>

      <section className="flex items-center bg-[#e7eef2] px-6 py-12 sm:px-10">
        <form action={loginAction} className="mx-auto w-full max-w-[24rem]">
          <h2 className="text-[1.7rem] font-extrabold text-gekraf-ink">Masuk</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-gekraf-muted">
            Gunakan akun admin yang sudah dibuat.
          </p>
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-[#9a3412] bg-[#fff1e8] px-3.5 py-2.5 text-[14.5px] leading-snug font-semibold text-[#9a3412]"
            >
              Username atau password salah.
            </p>
          )}

          <label className="mt-6 block text-[15px] font-bold text-gekraf-ink" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-[16px] text-gekraf-ink outline-none focus-visible:border-gekraf-cyan focus-visible:ring-2 focus-visible:ring-gekraf-cyan/30"
          />

          <label className="mt-4 block text-[15px] font-bold text-gekraf-ink" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-[16px] text-gekraf-ink outline-none focus-visible:border-gekraf-cyan focus-visible:ring-2 focus-visible:ring-gekraf-cyan/30"
          />

          <PendingButton className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gekraf-gold px-5 py-3 text-[16px] font-extrabold text-gekraf-ink transition hover:bg-gekraf-gold-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gekraf-ink disabled:cursor-wait disabled:opacity-80">
            Masuk
          </PendingButton>
        </form>
      </section>
    </div>
  );
}
