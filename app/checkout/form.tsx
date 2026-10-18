"use client";

import { useActionState, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import { checkoutAction, previewReferralAction, type CheckoutState } from "@/lib/actions";
import { toast } from "@/app/toast";
import type { PayAccount } from "@/lib/sales";
import type { Site } from "@/lib/types";
import { AlertIcon, CheckIcon, CopyIcon, SpinnerIcon, UploadIcon, WhatsAppIcon } from "./icons";

type Plan = Site["pricing"]["plans"][number];

const fieldClass = (invalid: boolean) =>
  [
    "w-full rounded-xl border bg-[#fbfcfd] px-3.5 py-2.5 text-[15.5px] font-semibold text-gekraf-ink caret-gekraf-cyan outline-none transition",
    "placeholder:font-normal placeholder:text-[#9aa1ab]",
    invalid
      ? "border-[#e5938c] bg-[#fffafa] focus-visible:border-[#b4231a] focus-visible:ring-2 focus-visible:ring-[#b4231a]/15"
      : "border-[#dfe4e8] focus-visible:border-gekraf-cyan focus-visible:ring-2 focus-visible:ring-gekraf-cyan/20",
  ].join(" ");

function inputProps(id: string, error: string | undefined) {
  return {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: fieldClass(Boolean(error)),
  };
}

function Field({
  id,
  label,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="block text-[13.5px] font-bold text-gekraf-ink">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug font-semibold text-[#b4231a]"
        >
          <AlertIcon size={14} className="mt-[2px] shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function TearLine({ children }: { children: string }) {
  return (
    <div
      aria-hidden
      className="mt-8 flex items-center gap-4 text-[12px] font-extrabold tracking-[0.18em] text-[#8a919c] uppercase"
    >
      <span className="h-0 flex-1 border-t-2 border-dashed border-[#d3dde2]" />
      <span className="whitespace-nowrap">{children}</span>
      <span className="h-0 flex-1 border-t-2 border-dashed border-[#d3dde2]" />
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2200);
        } catch {
          // Clipboard blocked: the number stays selectable text, nothing breaks.
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-bold transition focus-visible:ring-2 focus-visible:ring-gekraf-cyan/40 focus-visible:outline-none ${
        copied
          ? "border-gekraf-cyan bg-[#e8f6fa] text-gekraf-cyan-deep"
          : "border-gekraf-cyan/30 bg-white text-gekraf-cyan-deep hover:border-gekraf-cyan/60 hover:bg-[#e8f6fa]"
      }`}
    >
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {copied ? "Tersalin" : label}
      <span role="status" className="sr-only">
        {copied ? `${label} berhasil disalin` : ""}
      </span>
    </button>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ProofPick({ error }: { error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ name: string; size: string; url: string } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.url);
    },
    [picked],
  );

  function reject(message: string) {
    setLocalError(message);
    setPicked(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function accept(file: File | undefined) {
    setLocalError(null);
    if (!file || file.size === 0) return;
    if (!file.type.startsWith("image/")) {
      reject("File harus berupa gambar — JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject("Ukuran gambar maksimal 4 MB. Perkecil dulu, lalu pilih lagi.");
      return;
    }
    setPicked({ name: file.name, size: formatSize(file.size), url: URL.createObjectURL(file) });
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file || !inputRef.current) return;
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      inputRef.current.files = transfer.files;
      accept(file);
    } catch {
      setLocalError("Lepas file tidak didukung browser ini. Klik area ini untuk memilih gambar.");
    }
  }

  const shownError = localError ?? error;
  const invalid = Boolean(shownError);

  return (
    <div className="mt-4">
      <label
        htmlFor="proof"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-4 transition focus-within:ring-2 focus-within:ring-gekraf-cyan/30 sm:px-5 ${
          dragging
            ? "border-gekraf-cyan bg-[#e8f6fa]"
            : invalid
              ? "border-[#e5938c] bg-[#fffafa] hover:border-[#d97f76]"
              : picked
                ? "border-gekraf-cyan/50 bg-[#f4fbfd] hover:border-gekraf-cyan"
                : "border-[#cfd8de] bg-[#fbfcfd] hover:border-gekraf-cyan/60 hover:bg-[#f4fbfd]"
        }`}
      >
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
            picked ? "bg-gekraf-cyan text-white" : "bg-[#e8f6fa] text-gekraf-cyan-deep"
          }`}
        >
          {picked ? <CheckIcon size={22} /> : <UploadIcon size={22} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold text-gekraf-ink">
            {picked ? picked.name : "Pilih gambar bukti transfer"}
          </span>
          <span className="mt-0.5 block text-[13.5px] text-gekraf-muted">
            {picked ? `${picked.size} · siap dikirim` : "Tarik ke sini atau klik · JPG, PNG, WEBP · maksimal 4 MB"}
          </span>
        </span>
        <span className="hidden shrink-0 rounded-full border border-[#cfd8de] bg-white px-3.5 py-1.5 text-[13px] font-bold text-gekraf-ink sm:inline-block">
          {picked ? "Ganti" : "Pilih file"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          required
          className="sr-only"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={invalid ? "proof-error" : undefined}
          onChange={(event) => accept(event.target.files?.[0])}
        />
      </label>

      {shownError ? (
        <p id="proof-error" className="mt-2 flex items-start gap-1.5 text-[13px] leading-snug font-semibold text-[#b4231a]">
          <AlertIcon size={14} className="mt-[2px] shrink-0" />
          <span>{shownError}</span>
        </p>
      ) : null}

      {picked ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-[#e6ebee] bg-[#fbfcfd]">
          {/* Local object URL of the just-picked file; next/image cannot serve a blob. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={picked.url} alt="Pratinjau bukti pembayaran" className="max-h-52 w-full object-contain" />
          <div className="flex items-center justify-between gap-3 border-t border-[#e6ebee] px-3.5 py-2">
            <p className="text-[13px] text-gekraf-muted">Pastikan nominal dan tujuan transfer terbaca jelas.</p>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                if (inputRef.current) inputRef.current.value = "";
                setPicked(null);
                setLocalError(null);
              }}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold text-[#b4231a] transition hover:bg-[#fdf1ef] focus-visible:ring-2 focus-visible:ring-[#b4231a]/30 focus-visible:outline-none"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CheckoutForm({
  plan,
  accounts,
  whatsappHref,
}: {
  plan: Plan;
  accounts: PayAccount[];
  whatsappHref: string;
}) {
  const [state, formAction, pending] = useActionState(checkoutAction, null as CheckoutState);
  const formRef = useRef<HTMLFormElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
  const fieldErrors = state?.fieldErrors ?? {};
  const [referral, setReferral] = useState("");
  const [referralNote, setReferralNote] = useState("");
  const [applied, setApplied] = useState<{ name: string; payable: string; discountLabel: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const payable = applied?.payable ?? plan.price;

  // Errors come back as state, not a redirect: send focus to the first thing
  // that needs fixing (or to the banner when the problem is not a field).
  useEffect(() => {
    if (!state?.message) return;
    toast(state.backToPlans ? "warn" : "off", state.message);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    if (first) first.focus();
    else bannerRef.current?.focus();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={pending}
      className="min-w-0 border-t-2 border-dashed border-[#d3dde2] px-5 py-7 sm:px-7 lg:rounded-none lg:border-t-0 lg:border-l-2 lg:px-[34px] lg:py-[30px]"
    >
      <input type="hidden" name="plan" value={plan.name} />

      {state?.message ? (
        <div
          ref={bannerRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-[#f0c7c2] bg-[#fdf1ef] px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-[#b4231a]/30"
        >
          <AlertIcon size={18} className="mt-0.5 shrink-0 text-[#b4231a]" />
          <div>
            <p className="text-[14.5px] leading-relaxed font-semibold text-[#9a3412]">{state.message}</p>
            {state.backToPlans ? (
              <Link
                href="/#harga"
                className="mt-1.5 inline-block text-[14px] font-bold text-gekraf-cyan-deep underline decoration-gekraf-cyan/40 underline-offset-2 transition hover:text-gekraf-cyan"
              >
                Lihat paket lain
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="inline-flex rounded-full border border-[#cfe9f1] bg-[#e8f6fa] px-3.5 py-1.5 text-[13px] font-extrabold tracking-[0.08em] text-[#016b86]">
          {plan.name}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
        <s className="text-[19px] font-bold text-[#f0301f] decoration-[2.5px]">{plan.priceWas}</s>
        <p className="text-[clamp(2rem,3.4vw,2.625rem)] leading-none font-extrabold tracking-[-0.02em] text-gekraf-cyan tabular-nums">
          {plan.price}
        </p>
      </div>

      <ul className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[14.5px] leading-snug font-semibold text-gekraf-ink/85">
            <CheckIcon size={15} className="mt-[3px] shrink-0 text-gekraf-cyan" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-[#eef1f3]" />

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-[12.5px] font-extrabold tracking-[0.16em] text-[#8a919c] uppercase">
          Data pemesan
        </h2>
        <p className="text-[12.5px] font-semibold text-gekraf-muted">Semua kolom wajib diisi.</p>
      </div>

      <div className="mt-3.5 grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <Field id="fullName" label="Nama lengkap" error={fieldErrors.fullName} wide>
          <input
            {...inputProps("fullName", fieldErrors.fullName)}
            required
            autoComplete="name"
            placeholder="Sesuai kartu identitas"
          />
        </Field>
        <Field id="email" label="Email" error={fieldErrors.email}>
          <input
            {...inputProps("email", fieldErrors.email)}
            type="email"
            required
            autoComplete="email"
            placeholder="nama@perusahaan.co.id"
          />
        </Field>
        <Field id="whatsapp" label="Nomor WhatsApp" error={fieldErrors.whatsapp}>
          <input
            {...inputProps("whatsapp", fieldErrors.whatsapp)}
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xx xxxx xxxx"
          />
        </Field>
        <Field id="institution" label="Instansi" error={fieldErrors.institution}>
          <input
            {...inputProps("institution", fieldErrors.institution)}
            required
            autoComplete="organization"
            placeholder="Nama perusahaan atau komunitas"
          />
        </Field>
        <Field id="jobTitle" label="Jabatan" error={fieldErrors.jobTitle}>
          <input
            {...inputProps("jobTitle", fieldErrors.jobTitle)}
            required
            autoComplete="organization-title"
            placeholder="Direktur, Manajer, Founder…"
          />
        </Field>
        <Field id="address" label="Alamat" error={fieldErrors.address} wide>
          <textarea
            {...inputProps("address", fieldErrors.address)}
            required
            rows={2}
            autoComplete="street-address"
            placeholder="Kota dan alamat singkat"
            className={`${fieldClass(Boolean(fieldErrors.address))} resize-none`}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field id="referral" label="Kode referral" error={fieldErrors.referral || referralNote || undefined}>
          <div className="flex gap-2">
            <input
              {...inputProps("referral", fieldErrors.referral || referralNote || undefined)}
              value={referral}
              autoComplete="off"
              placeholder="Opsional, jika Anda punya kode"
              className={`${fieldClass(Boolean(fieldErrors.referral || referralNote))} min-w-0 flex-1 uppercase`}
              onChange={(event) => {
                setReferral(event.target.value);
                setApplied(null);
                setReferralNote("");
              }}
            />
            <button
              type="button"
              disabled={checking}
              onClick={async () => {
                setChecking(true);
                setReferralNote("");
                const result = await previewReferralAction(plan.name, referral);
                setChecking(false);
                if (!result.ok) {
                  setApplied(null);
                  setReferralNote(result.error);
                  toast("off", result.error);
                  return;
                }
                if (result.empty) {
                  setApplied(null);
                  return;
                }
                setReferral(result.code);
                setApplied({ name: result.name, payable: result.payable, discountLabel: result.discountLabel });
                toast("ok", `Kode ${result.name} dipakai. Potongan ${result.discountLabel}.`);
              }}
              className="shrink-0 rounded-xl border border-[#dfe4e8] bg-white px-4 text-[14px] font-extrabold text-gekraf-ink transition hover:border-gekraf-cyan hover:text-gekraf-cyan-deep focus-visible:ring-2 focus-visible:ring-gekraf-cyan/30 focus-visible:outline-none disabled:opacity-60"
            >
              {checking ? "Memeriksa…" : "Pakai"}
            </button>
          </div>
          <p className="mt-1.5 text-[13px] text-gekraf-muted">
            {applied
              ? `Kode ${applied.name} dipakai. Potongan ${applied.discountLabel}.`
              : "Kosongkan bila tidak ada. Pakai kode sebelum transfer agar nominalnya berubah."}
          </p>
        </Field>
      </div>

      <TearLine>Pembayaran</TearLine>
      <h2 className="sr-only">Pembayaran</h2>

      <fieldset className="mt-4">
        <legend className="sr-only">Pilih rekening pembayaran</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {accounts.map((item) => {
            const active = item.id === account?.id;
            return (
              <label key={item.id} className="block cursor-pointer">
                <input
                  type="radio"
                  name="accountId"
                  value={item.id}
                  checked={active}
                  onChange={() => setAccountId(item.id)}
                  className="peer sr-only"
                  aria-describedby={fieldErrors.accountId ? "account-error" : undefined}
                />
                <span
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition peer-focus-visible:ring-2 peer-focus-visible:ring-gekraf-cyan/40 peer-focus-visible:ring-offset-2 ${
                    active
                      ? "border-gekraf-cyan bg-[#f0f9fc] ring-2 ring-gekraf-cyan/15"
                      : "border-[#dfe4e8] bg-[#fbfcfd] hover:border-[#bcd6df]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full border-2 transition ${
                      active ? "border-gekraf-cyan bg-gekraf-cyan" : "border-[#c3ccd3] bg-white"
                    }`}
                  >
                    <span className={`h-[7px] w-[7px] rounded-full bg-white transition ${active ? "scale-100" : "scale-0"}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-extrabold text-gekraf-ink">{item.bank}</span>
                    <span className="block truncate text-[13px] text-gekraf-muted">a.n. {item.name}</span>
                  </span>
                  {active ? <CheckIcon size={16} className="ml-auto shrink-0 text-gekraf-cyan" /> : null}
                </span>
              </label>
            );
          })}
        </div>
        {fieldErrors.accountId ? (
          <p id="account-error" className="mt-2 flex items-start gap-1.5 text-[13px] font-semibold text-[#b4231a]">
            <AlertIcon size={14} className="mt-[2px] shrink-0" />
            <span>{fieldErrors.accountId}</span>
          </p>
        ) : null}

        {account ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#d6e9f0] bg-[#f4fbfd]">
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[11.5px] font-extrabold tracking-[0.14em] text-gekraf-cyan-deep uppercase">
                  Nominal transfer
                </p>
                {applied ? (
                  <div className="mt-1.5 flex flex-col items-start gap-1">
                    <s className="text-[14px] leading-none font-bold text-[#f0301f] decoration-[2.5px] tabular-nums">
                      {plan.price}
                    </s>
                    <span className="text-[21px] leading-none font-extrabold text-gekraf-ink tabular-nums">{payable}</span>
                    <span className="text-[13px] font-bold text-[#016b86]">Potongan {applied.discountLabel}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-[21px] leading-none font-extrabold text-gekraf-ink tabular-nums">{payable}</p>
                )}
              </div>
              <div>
                <p className="text-[11.5px] font-extrabold tracking-[0.14em] text-gekraf-cyan-deep uppercase">
                  Nomor rekening
                </p>
                <p className="mt-1 text-[21px] leading-none font-extrabold tracking-wide text-gekraf-ink tabular-nums">
                  {account.number}
                </p>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <CopyButton value={account.number} label="Salin nomor" />
                <CopyButton value={payable.replace(/\D/g, "")} label="Salin nominal" />
              </div>
            </div>
            <p className="border-t border-[#d6e9f0] bg-white/70 px-4 py-2.5 text-[13.5px] text-gekraf-muted sm:px-5">
              Atas nama <b className="font-extrabold text-gekraf-ink">{account.name}</b> · {account.bank} · transfer
              tepat sampai digit terakhir agar mudah diverifikasi.
            </p>
          </div>
        ) : null}
      </fieldset>

      <TearLine>Bukti transfer</TearLine>
      <h2 className="sr-only">Bukti transfer</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-gekraf-muted">
        Unggah tangkapan layar atau foto bukti transfer. Panitia memverifikasi setiap bukti sebelum tiket dikirim.
      </p>
      <ProofPick error={fieldErrors.proof} />

      <div className="mt-8">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gekraf-gold px-8 py-4 text-[18px] font-extrabold text-gekraf-ink shadow-[0_8px_28px_rgba(242,203,25,0.28)] transition hover:bg-gekraf-gold-bright focus-visible:ring-2 focus-visible:ring-gekraf-ink/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
        >
          {pending ? <SpinnerIcon size={18} /> : null}
          {pending ? "Mengirim pendaftaran…" : "Kirim pendaftaran"}
          {pending ? null : <span aria-hidden>→</span>}
        </button>
        <p className="mt-3 text-center text-[13.5px] leading-relaxed text-gekraf-muted">
          Nomor tiket dikirim ke email Anda setelah pembayaran dikonfirmasi panitia.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-[#eef1f3] pt-4 text-[13.5px] text-gekraf-muted">
        <span>Butuh bantuan sebelum mengirim?</span>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-gekraf-cyan-deep underline decoration-gekraf-cyan/40 underline-offset-2 transition hover:text-gekraf-cyan"
        >
          <WhatsAppIcon size={15} />
          Hubungi panitia
        </a>
      </div>
    </form>
  );
}
