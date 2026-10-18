"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePick } from "@/app/components/ImagePick";
import { saveSectionAction, uploadImageAction } from "@/lib/actions";
import {
  Btn,
  BtnLink,
  Card,
  CardHead,
  Field,
  Icon,
  Notice,
  Pill,
  inputClass,
} from "../ui";

const LABELS: Record<string, string> = {
  title: "Judul",
  description: "Deskripsi",
  logoSrc: "File logo",
  logoAlt: "Teks alternatif logo",
  brand: "Nama brand",
  ctaLabel: "Teks tombol",
  ctaHref: "Tautan tombol",
  links: "Menu",
  href: "Tautan",
  label: "Label",
  badge: "Label kecil",
  titleLine1: "Baris judul 1",
  titleGold: "Kata berwarna emas",
  titleRest: "Sisa judul",
  subtitle: "Subjudul",
  body: "Paragraf",
  date: "Tanggal",
  time: "Waktu",
  venue: "Tempat",
  city: "Kota",
  quota: "Catatan kuota",
  backgroundSrc: "Gambar latar",
  speakers: "Foto di hero",
  name: "Nama",
  role: "Peran",
  src: "Gambar",
  cards: "Kartu",
  caption: "Keterangan",
  items: "Daftar",
  people: "Pemateri",
  headline: "Judul kartu",
  points: "Poin",
  modules: "Modul",
  desc: "Deskripsi singkat",
  benefits: "Benefit",
  line1: "Baris 1",
  line2: "Baris 2",
  text: "Kutipan",
  plans: "Paket",
  priceWas: "Harga coret",
  price: "Harga asli",
  slots: "Jumlah slot",
  features: "Fasilitas",
  q: "Pertanyaan",
  a: "Jawaban",
  button: "Teks tombol",
  buttonHref: "Tautan tombol",
  whatsappText: "Teks WhatsApp",
  whatsappNumber: "Nomor yang tampil",
  whatsappHref: "Tautan WhatsApp",
  image: "Gambar latar",
};

const LONG = new Set(["body", "description", "text", "a", "headline", "caption", "role", "title"]);
const IMAGE_KEYS = /^(logoSrc|backgroundSrc|src|image)$/;

type Path = (string | number)[];

function labelFor(key: string) {
  if (LABELS[key]) return LABELS[key];
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function setAt(root: unknown, path: Path, next: unknown): unknown {
  if (path.length === 0) return next;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    return root.map((item, index) => (index === head ? setAt(item, rest, next) : item));
  }
  const current = (root ?? {}) as Record<string, unknown>;
  return { ...current, [String(head)]: setAt(current[String(head)], rest, next) };
}

function blank(sample: unknown): unknown {
  if (typeof sample === "string") return "";
  if (Array.isArray(sample)) return sample[0] === undefined ? [] : [blank(sample[0])];
  if (sample && typeof sample === "object") {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, blank(value)]));
  }
  return "";
}

function itemTitle(item: unknown, index: number) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const record = item as Record<string, unknown>;
    const name = record.name ?? record.title ?? record.q ?? record.label;
    if (typeof name === "string" && name.trim()) return name;
  }
  return `Item ${index + 1}`;
}

function isPlain(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function Editor({
  section,
  label,
  hint,
  initial,
  sections,
  saved,
  failed,
}: {
  section: string;
  label: string;
  hint: string;
  initial: unknown;
  sections: { id: string; label: string; empty: number }[];
  saved: boolean;
  failed: boolean;
}) {
  const [value, setValue] = useState<unknown>(initial);
  const form = useRef<HTMLFormElement>(null);

  const dirty = useMemo(
    () => JSON.stringify(value) !== JSON.stringify(initial),
    [value, initial],
  );
  const emptyFields = useMemo(() => countEmpty(value), [value]);

  function update(path: Path, next: unknown) {
    setValue((current: unknown) => setAt(current, path, next));
  }

  useEffect(() => {
    function key(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        form.current?.requestSubmit();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  const entries = isPlain(value) ? Object.entries(value) : [];
  const scalars = entries.filter(([, child]) => !Array.isArray(child) && !isPlain(child));
  const collections = entries.filter(([, child]) => Array.isArray(child) || isPlain(child));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[12.5px] text-dash-muted">Konten situs · {label}</p>
        <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[26px] leading-tight font-bold tracking-[-0.03em] text-dash-ink sm:text-[30px]">
            {label}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={emptyFields === 0 ? "ok" : "warn"}>
              {emptyFields === 0 ? "Terisi lengkap" : `${emptyFields} kolom kosong`}
            </Pill>
            <BtnLink href={`/#${section}`} target="_blank" rel="noreferrer" icon="external">
              Lihat di halaman
            </BtnLink>
          </div>
        </div>
        <p className="mt-2 max-w-[68ch] text-[13.5px] text-dash-muted">
          {hint} Simpan agar perubahan tampil di halaman utama.
        </p>
      </div>

      <nav aria-label="Pindah bagian konten" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex items-center gap-1.5">
          {sections.map((item) => {
            const active = item.id === section;
            return (
              <li key={item.id}>
                <Link
                  href={`/dashboard/${item.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "border-transparent bg-dash-fill text-white"
                      : "border-dash-line text-dash-muted hover:bg-dash-surface hover:text-dash-ink"
                  }`}
                >
                  {item.label}
                  {item.empty > 0 ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? "bg-white/70" : "bg-dash-warn-fg"
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form ref={form} action={saveSectionAction} className="flex flex-col gap-4">
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="payload" value={JSON.stringify(value)} />

        {failed ? (
          <Notice tone="off">
            Gagal menyimpan perubahan. Muat ulang halaman ini, lalu coba lagi.
          </Notice>
        ) : null}

        {scalars.length > 0 ? (
          <Card>
            <CardHead icon="book" title="Teks utama" meta={<Pill tone="neutral">{scalars.length} kolom</Pill>} />
            <div className="grid gap-4 border-t border-dash-line-soft px-[var(--dash-gutter)] py-4 md:grid-cols-2 xl:grid-cols-3">
              {scalars.map(([key, child]) => (
                <div key={key} className={isLong(key, child) ? "md:col-span-2 xl:col-span-3" : ""}>
                  <StringField
                    name={key}
                    value={String(child ?? "")}
                    path={[key]}
                    onSet={update}
                  />
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {collections.map(([key, child]) => (
          <CollectionCard
            key={key}
            name={key}
            value={child}
            path={[key]}
            onSet={update}
          />
        ))}

        <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-[14px] border border-dash-line bg-dash-surface px-[var(--dash-gutter)] py-3">
          <Btn type="submit" variant="primary" icon="check">
            Simpan perubahan
          </Btn>
          <span className="flex items-center gap-2 text-[13px]">
            {dirty ? (
              <span className="flex items-center gap-1.5 font-medium text-dash-warn-fg">
                <Icon name="pencil" className="h-4 w-4" />
                Ada perubahan belum disimpan
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium text-dash-muted">
                <Icon name="check" className="h-4 w-4" />
                Tidak ada perubahan
              </span>
            )}
          </span>
          {saved ? (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-dash-ok-fg">
              <Icon name="checkCircle" className="h-4 w-4" />
              Tersimpan. Cek halaman utama.
            </span>
          ) : null}
          <span className="ml-auto hidden text-[12.5px] text-dash-muted sm:block">
            Tekan ⌘/Ctrl + S untuk menyimpan
          </span>
        </div>
      </form>
    </div>
  );
}

function isLong(key: string, value: unknown) {
  const text = typeof value === "string" ? value : "";
  return LONG.has(key) || text.length > 90;
}

function countEmpty(value: unknown): number {
  if (typeof value === "string") return value.trim() ? 0 : 1;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countEmpty(item), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce((sum, item) => sum + countEmpty(item), 0);
  }
  return 0;
}

function StringField({
  name,
  value,
  path,
  onSet,
  required,
}: {
  name: string;
  value: string;
  path: Path;
  onSet: (path: Path, next: unknown) => void;
  required?: boolean;
}) {
  const id = path.join("-") || "field";

  if (IMAGE_KEYS.test(name)) {
    return <ImageField value={value} path={path} name={name} onSet={onSet} />;
  }

  const long = LONG.has(name) || value.length > 90;

  return (
    <Field
      id={id}
      label={labelFor(name)}
      hint={long ? "Baris baru akan tampil sebagai baris baru di halaman." : undefined}
    >
      <div className="flex items-start gap-2">
        {long ? (
          <textarea
            id={id}
            rows={4}
            value={value}
            onChange={(event) => onSet(path, event.target.value)}
            className={`${inputClass} h-auto min-h-24 py-2.5 leading-relaxed`}
          />
        ) : (
          <input
            id={id}
            value={value}
            onChange={(event) => onSet(path, event.target.value)}
            className={inputClass}
          />
        )}
      </div>
      {value.trim() === "" ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-dash-warn-fg">
          <Icon name="alert" className="h-3.5 w-3.5" />
          {required ? "Wajib diisi." : "Belum diisi — halaman akan menampilkan bagian ini kosong."}
        </p>
      ) : null}
    </Field>
  );
}

function ImageField({
  value,
  path,
  name,
  onSet,
}: {
  value: string;
  path: Path;
  name: string;
  onSet: (path: Path, next: unknown) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const id = path.join("-") || "gambar";

  return (
    <div>
      <p className="text-[13px] font-semibold text-dash-ink">{labelFor(name)}</p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-24 w-32 rounded-[10px] border border-dash-line bg-dash-bg object-contain"
          />
        ) : (
          <span className="dash-empty-ring grid h-24 w-32 place-items-center rounded-[10px] text-dash-muted">
            <Icon name="image" className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <ImagePick
            id={id}
            tone="dash"
            disabled={busy}
            label={busy ? "Mengunggah…" : value ? "Ganti gambar" : "Pilih gambar"}
            fileName={fileName}
            onChange={async (file) => {
              if (!file) return;
              setBusy(true);
              setError("");
              setFileName(file.name);
              const body = new FormData();
              body.set("file", file);
              const result = await uploadImageAction(body);
              setBusy(false);
              if (result.ok) onSet(path, result.src);
              else setError(result.error);
            }}
          />
          <p className="mt-2 max-w-[42ch] text-[12.5px] text-dash-muted">
            PNG, JPG, WEBP, atau GIF maksimal 4 MB. Gambar tampil di halaman pendaftaran.
          </p>
          {value ? (
            <button
              type="button"
              onClick={() => onSet(path, "")}
              className="mt-1 text-[12.5px] font-semibold text-dash-off-fg hover:underline"
            >
              Kosongkan gambar
            </button>
          ) : null}
          {error ? <p className="mt-1.5 text-[12.5px] font-medium text-dash-off-fg">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

function CollectionCard({
  name,
  value,
  path,
  onSet,
  bare = false,
}: {
  name: string;
  value: unknown;
  path: Path;
  onSet: (path: Path, next: unknown) => void;
  bare?: boolean;
}) {
  if (Array.isArray(value)) {
    const strings = value.every((item) => typeof item === "string");
    return (
      <Section name={name} bare={bare}>
        <CardHead
          icon={strings ? "list" : "book"}
          title={labelFor(name)}
          meta={<Pill tone="neutral">{value.length} item</Pill>}
          className={bare ? "px-0" : ""}
          right={
            <Btn
              size="sm"
              icon="plus"
              onClick={() => onSet(path, value.concat(blank(value[0] ?? "")))}
            >
              Tambah
            </Btn>
          }
        />
        <div
          className={`flex flex-col gap-3 ${bare ? "border-t border-dash-line-soft pt-3" : "border-t border-dash-line-soft px-[var(--dash-gutter)] py-4"}`}
        >
          {strings
            ? value.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <StringField
                      name={name}
                      value={String(item)}
                      path={path.concat(index)}
                      onSet={onSet}
                    />
                  </div>
                  <Btn
                    size="sm"
                    variant="danger"
                    icon="trash"
                    aria-label={`Hapus ${labelFor(name)} ${index + 1}`}
                    onClick={() => onSet(path, value.filter((_, i) => i !== index))}
                  />
                </div>
              ))
            : value.map((item, index) => {
                const children = isPlain(item) ? Object.entries(item) : [];
                return (
                  <div key={index} className="rounded-[12px] border border-dash-line">
                    <div className="flex items-center gap-2 border-b border-dash-line-soft px-3.5 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-dash-ink">
                        {itemTitle(item, index)}
                      </span>
                      <Btn
                        size="sm"
                        variant="danger"
                        icon="trash"
                        aria-label={`Hapus ${itemTitle(item, index)}`}
                        onClick={() => onSet(path, value.filter((_, i) => i !== index))}
                      >
                        Hapus
                      </Btn>
                    </div>
                    <div className="grid gap-4 px-3.5 py-3.5 md:grid-cols-2 2xl:grid-cols-3">
                      {children.map(([key, child]) =>
                        Array.isArray(child) ? (
                          <div key={key} className="md:col-span-2 2xl:col-span-3">
                            <CollectionCard
                              bare
                              name={key}
                              value={child}
                              path={path.concat(index, key)}
                              onSet={onSet}
                            />
                          </div>
                        ) : (
                          <div
                            key={key}
                            className={
                              key === "src" || key === "image" || isLong(key, child)
                                ? "md:col-span-2 2xl:col-span-3"
                                : ""
                            }
                          >
                            <StringField
                              name={key}
                              value={typeof child === "string" ? child : String(child ?? "")}
                              path={path.concat(index, key)}
                              onSet={onSet}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
          {value.length === 0 ? (
            <p className="dash-empty-ring rounded-[12px] px-4 py-6 text-center text-[13px] text-dash-muted">
              Belum ada isi. Tekan Tambah untuk membuat item pertama.
            </p>
          ) : null}
        </div>
      </Section>
    );
  }

  if (isPlain(value)) {
    return (
      <Section name={name} bare={bare}>
        <CardHead icon="book" title={labelFor(name)} className={bare ? "px-0" : ""} />
        <div
          className={`flex flex-col gap-4 ${bare ? "border-t border-dash-line-soft pt-4" : "border-t border-dash-line-soft px-[var(--dash-gutter)] py-4"}`}
        >
          {Object.entries(value).map(([key, child]) => (
            <CollectionCard
              key={key}
              bare={bare}
              name={key}
              value={child}
              path={path.concat(key)}
              onSet={onSet}
            />
          ))}
        </div>
      </Section>
    );
  }

  return null;
}

/* A card at the top level, a plain block once it is already inside a card. */
function Section({
  name,
  bare,
  children,
}: {
  name: string;
  bare: boolean;
  children: React.ReactNode;
}) {
  if (bare) {
    return (
      <div aria-label={labelFor(name)} className="flex flex-col rounded-[12px] border border-dash-line-soft p-3.5">
        {children}
      </div>
    );
  }
  return <Card>{children}</Card>;
}
