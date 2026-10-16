"use client";

type Props = {
  id: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  fileName?: string | null;
  /** "dash" renders the admin back office treatment instead of the brand one. */
  tone?: "brand" | "dash";
  onChange: (file: File | null) => void;
};

export function ImagePick({
  id,
  name,
  required,
  disabled,
  label = "Pilih gambar",
  fileName,
  tone = "brand",
  onChange,
}: Props) {
  const skin =
    tone === "dash"
      ? "rounded-[10px] border border-dash-line bg-dash-surface px-4 py-2 text-[13px] font-semibold text-dash-ink hover:bg-dash-bg focus-visible:outline-dash-accent"
      : "rounded-full border-gekraf-cyan bg-gekraf-cyan px-5 py-2.5 text-[14px] font-bold text-white hover:bg-gekraf-cyan-deep focus-visible:outline-gekraf-cyan";
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        required={required}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <label
        htmlFor={id}
        className={`inline-flex cursor-pointer items-center justify-center border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${skin} ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {label}
      </label>
      {fileName ? (
        <span
          className={`max-w-[16rem] truncate text-[13px] ${tone === "dash" ? "text-dash-muted" : "text-gekraf-muted"}`}
        >
          {fileName}
        </span>
      ) : null}
    </div>
  );
}
