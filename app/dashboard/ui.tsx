import type { ReactNode } from "react";
import Link from "next/link";
import { PendingButton } from "@/app/submit";

/*
  Presentational pieces shared by every admin screen. Nothing here is
  interactive, so the module stays usable from both server and client
  components. Layout comes from Tailwind utilities; the shape of an atom
  (pill, table, focus ring) comes from the `.dash-*` rules in globals.css.
*/

const PATHS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9.5 8h5M9.5 12h5",
  users: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 20a8 8 0 0 1 16 0",
  card: "M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5zM3 10.5h18M6.5 14h4",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  chevron: "M6 9l6 6 6-6",
  chevronLeft: "M14 6l-6 6 6 6",
  chevronRight: "M10 6l6 6-6 6",
  bell: "M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6M9.5 20a2.6 2.6 0 0 0 5 0",
  external: "M14 4h6v6M20 4l-9 9M9 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3",
  calendar: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5zM4 10h16M8 3v4M16 3v4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7.5V12l3 2",
  checkCircle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M8.5 12.5l2.5 2.5 4.5-5",
  circle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18",
  check: "M5 13l4.5 4.5L19 7",
  x: "M6 6l12 12M18 6L6 18",
  trash: "M4 7h16M9.5 7V5h5v2M6.5 7l1 13h9l1-13M10.5 11v5M13.5 11v5",
  pencil: "M4 20h4L18 10a2.83 2.83 0 0 0-4-4L4 16zM13.5 6.5l4 4",
  logout: "M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2M15 12H3m0 0 3-3m-3 3 3 3",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.5v.2M12 17h.01",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M4.5 12H3m18 0h-1.5M12 4.5V3m0 18v-1.5M6.6 6.6 5.6 5.6m12.8 12.8-1-1M6.6 17.4l-1 1M18.4 5.6l-1 1",
  dots: "M5.5 12h.01M12 12h.01M18.5 12h.01",
  image: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5zM4 15.5 8.5 11l5 5M14 13.5l2-2 4 4M9 9.5h.01",
  upload: "M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  tag: "M4 5.5A1.5 1.5 0 0 1 5.5 4h6l8.5 8.5-8 8L4 12zM8.5 8.5h.01",
  bars: "M4 7h16M4 12h16M4 17h16",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3M6 12a6 6 0 0 0 12 0M12 18v3M9 21h6",
  star: "M12 4l2.4 5 5.6.8-4.1 4 1 5.6-4.9-2.8-4.9 2.8 1-5.6-4.1-4 5.6-.8z",
  quote: "M9.5 7C6.5 8 5 10.2 5 14h4V7zM19.5 7C16.5 8 15 10.2 15 14h4V7z",
  ticket: "M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v1.6a2 2 0 0 0 0 3.8v1.6A1.5 1.5 0 0 1 18.5 17h-13A1.5 1.5 0 0 1 4 15.5v-1.6a2 2 0 0 0 0-3.8zM9 7v10",
  megaphone: "M4 10.5V13a1 1 0 0 0 1 1h2l7 4V5.5l-7 4H5a1 1 0 0 0-1 1M18 9.5a3.5 3.5 0 0 1 0 5",
  alert: "M12 4l9 16H3zM12 10.5v3.5M12 17.5h.01",
  wallet: "M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v8A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5zM16 12.5h2",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 11v5.5M12 7.5h.01",
  eye: "M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  camera: "M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-2h6.6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7",
  home: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z",
  book: "M6 4h9a3 3 0 0 1 3 3v13H8.5A2.5 2.5 0 0 1 6 17.5zM6 4v13.5M11 8.5h4",
  shield: "M12 4l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V7zM9 12l2 2 4-4",
  clockArrow: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7.5V12l4 2",
  sliders: "M4 8h10M18 8h2M4 16h4M12 16h8M15 5.5v5M9 13.5v5",
  download: "M12 4v12m0 0-4-4m4 4 4-4M4 18v.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V18",
  copy: "M9 9V6.5A1.5 1.5 0 0 1 10.5 5h8A1.5 1.5 0 0 1 20 6.5v8a1.5 1.5 0 0 1-1.5 1.5H16M4 10.5A1.5 1.5 0 0 1 5.5 9h8a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 18.5z",
  mail: "M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5zM5 8l7 5 7-5",
  filter: "M4 6h16M7 12h10M10 18h4",
} as const;

export type IconName = keyof typeof PATHS;

const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

/** Logo WhatsApp (filled) untuk tombol kirim tiket lewat chat. */
export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor" aria-hidden="true">
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

export function Icon({
  name,
  className = "h-[18px] w-[18px]",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------- containers ---------- */

export function Card({
  children,
  className = "",
  padded = false,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-[14px] border border-dash-line bg-dash-surface ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHead({
  icon,
  title,
  meta,
  right,
  className = "",
}: {
  icon: IconName;
  title: string;
  meta?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-[var(--dash-gutter)] py-3.5 ${className}`}
    >
      <Icon name={icon} className="h-[18px] w-[18px] text-dash-muted" />
      <h2 className="text-[15px] font-bold tracking-[-0.01em] text-dash-ink xl:text-[16px]">{title}</h2>
      {meta}
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

/* ---------- actions ---------- */

type Variant = "primary" | "outline" | "ghost" | "danger" | "quiet";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-dash-fill text-white hover:bg-dash-fill-hover active:bg-dash-fill-hover border border-transparent",
  outline:
    "bg-dash-surface text-dash-ink border border-dash-line hover:bg-dash-bg active:bg-dash-line-soft",
  ghost: "bg-transparent text-dash-muted border border-transparent hover:bg-dash-bg hover:text-dash-ink",
  danger:
    "bg-dash-surface text-dash-off-fg border border-dash-line hover:bg-dash-off-bg",
  quiet: "bg-dash-soft text-dash-fill-hover border border-dash-edge hover:bg-dash-edge",
};

const SIZES = {
  sm: "h-8 gap-1.5 rounded-[9px] px-3 text-[13px]",
  md: "h-9.5 gap-2 rounded-[10px] px-3.5 text-[13.5px]",
};

export function btnClass(
  variant: Variant = "outline",
  size: keyof typeof SIZES = "md",
  className = "",
) {
  return `inline-flex select-none items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
}

export function Btn({
  variant = "outline",
  size = "md",
  icon,
  trailingIcon,
  children,
  className = "",
  type = "button",
  ...rest
}: {
  variant?: Variant;
  size?: keyof typeof SIZES;
  icon?: IconName;
  trailingIcon?: IconName;
  children?: ReactNode;
  className?: string;
  type?: "button" | "submit";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (type === "submit") {
    return (
      <PendingButton className={btnClass(variant, size, className)} {...rest}>
        {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
        {children}
        {trailingIcon ? <Icon name={trailingIcon} className="h-4 w-4" /> : null}
      </PendingButton>
    );
  }

  return (
    <button type={type} className={btnClass(variant, size, className)} {...rest}>
      {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} className="h-4 w-4" /> : null}
    </button>
  );
}

export function BtnLink({
  href,
  variant = "outline",
  size = "md",
  icon,
  trailingIcon,
  children,
  className = "",
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof SIZES;
  icon?: IconName;
  trailingIcon?: IconName;
  children?: ReactNode;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:|^mailto:/.test(href);
  if (external) {
    return (
      <a href={href} className={btnClass(variant, size, className)} {...rest}>
        {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
        {children}
        {trailingIcon ? <Icon name={trailingIcon} className="h-4 w-4" /> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={btnClass(variant, size, className)} {...rest}>
      {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} className="h-4 w-4" /> : null}
    </Link>
  );
}

/* ---------- status ---------- */

export type Tone = "ok" | "wait" | "info" | "off" | "warn" | "neutral";

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className="dash-pill" data-tone={tone}>
      {children}
    </span>
  );
}

const ORDER_TONE: Record<string, { tone: Tone; label: string; icon: IconName }> = {
  pending: { tone: "wait", label: "Menunggu ACC", icon: "clock" },
  approved: { tone: "ok", label: "ACC", icon: "checkCircle" },
  rejected: { tone: "off", label: "Ditolak", icon: "x" },
};

export function OrderStatus({ status, short = false }: { status: string; short?: boolean }) {
  const entry = ORDER_TONE[status] ?? { tone: "neutral" as Tone, label: status, icon: "info" as IconName };
  return (
    <Pill tone={entry.tone}>
      <Icon name={entry.icon} className="h-3.5 w-3.5" />
      {short && status === "pending" ? "Menunggu" : entry.label}
    </Pill>
  );
}

/* ---------- identity ---------- */

const AVATAR_TONES = [
  "bg-dash-soft text-dash-fill-hover",
  "bg-dash-ok-bg text-dash-ok-fg",
  "bg-dash-wait-bg text-dash-wait-fg",
  "bg-dash-warn-bg text-dash-warn-fg",
];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toneFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) % 997;
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

export function Avatar({
  name,
  size = 28,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${toneFor(name)} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 2 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((name, index) => (
        <Avatar
          key={`${name}-${index}`}
          name={name}
          size={24}
          className={`ring-2 ring-dash-surface ${index > 0 ? "-ml-2" : ""}`}
        />
      ))}
      {rest > 0 ? (
        <span className="-ml-2 grid h-6 w-6 place-items-center rounded-full bg-dash-track text-[10px] font-semibold text-dash-muted ring-2 ring-dash-surface">
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

/* ---------- data display ---------- */

/* Dividers per cell: one column stacked on a phone, three or four across once
   there is room, with the row rules only where a row actually wraps. */
const SEPARATORS: Record<number, string[]> = {
  3: [
    "",
    "border-t border-dash-line-soft sm:border-t-0 sm:border-l",
    "border-t border-dash-line-soft sm:border-t-0 sm:border-l",
  ],
  4: [
    "",
    "border-t border-dash-line-soft sm:border-t-0 sm:border-l",
    "border-t border-dash-line-soft sm:border-t xl:border-t-0 xl:border-l",
    "border-t border-dash-line-soft sm:border-t sm:border-l xl:border-t-0",
  ],
};

export function StatStrip({
  items,
}: {
  items: { icon: IconName; value: string; label: string; hint?: string }[];
}) {
  const separators = SEPARATORS[items.length] ?? SEPARATORS[3];
  const columns = items.length > 3 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-3";

  return (
    <ul className={`grid overflow-hidden rounded-[14px] border border-dash-line bg-dash-surface p-0 ${columns}`}>
      {items.map((item, index) => (
        <li
          key={item.label}
          className={`flex items-center gap-3 px-[var(--dash-gutter)] py-3.5 ${separators[index] ?? ""}`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dash-soft text-dash-fill-hover">
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
          </span>
          <span className="flex min-w-0 flex-col-reverse">
            <span className="truncate text-[12.5px] text-dash-muted">
              {item.label}
              {item.hint ? ` · ${item.hint}` : ""}
            </span>
            <span className="tnum text-[22px] leading-tight font-bold tracking-[-0.03em] text-dash-ink">
              {item.value}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TableShell({
  cols,
  minWidth = "880px",
  dense = false,
  children,
  foot,
}: {
  cols: { key: string; label: ReactNode; width?: string; align?: "left" | "right" }[];
  minWidth?: string;
  dense?: boolean;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-b-[13px] border-t border-dash-line">
      <table className="dash-table" style={{ minWidth, tableLayout: dense ? "fixed" : undefined }}>
        <colgroup>
          {cols.map((col) => (
            <col key={col.key} style={col.width ? { width: col.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {cols.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${dense ? "px-2.5" : "px-[var(--dash-gutter)]"} py-2.5 text-[12px] font-semibold text-dash-muted xl:text-[12.5px] ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        {foot}
      </table>
    </div>
  );
}

export function Td({
  children,
  align = "left",
  dense = false,
  className = "",
}: {
  children?: ReactNode;
  align?: "left" | "right";
  dense?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`${dense ? "px-2.5" : "px-[var(--dash-gutter)]"} py-2.5 align-middle text-[13.5px] text-dash-ink xl:py-3 xl:text-[14px] ${
        align === "right" ? "text-right" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

export function RowHead({
  icon,
  children,
  aside,
}: {
  icon?: IconName;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon ? <Icon name={icon} className="h-4 w-4 text-dash-faint" /> : null}
      <span className="font-semibold text-dash-ink">{children}</span>
      {aside ? <span className="ml-auto flex items-center">{aside}</span> : null}
    </div>
  );
}

export function Meta({ children }: { children: ReactNode }) {
  return <span className="block text-[12.5px] leading-5 text-dash-muted">{children}</span>;
}

/** Teks dengan kata kunci pencarian disorot. Aman untuk teks apa pun
 *  (karakter khusus regex di query tidak ikut dievaluasi). */
export function Highlight({ text, query }: { text: string; query?: string }) {
  const needle = (query ?? "").trim();
  if (!needle) return <>{text}</>;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark
            key={index}
            className="rounded-[3px] bg-dash-accent/20 px-0.5 text-dash-fill"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function Progress({
  used,
  total,
  label,
}: {
  used: number;
  total: number;
  label?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 100;
  return (
    <div className="flex items-center gap-3">
      <span className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-dash-track">
        <span
          className="block h-full rounded-full bg-dash-accent"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="tnum shrink-0 text-[12.5px] font-semibold text-dash-muted">
        {label ?? `${used}/${total}`}
      </span>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline gap-1 text-[13px] font-semibold text-dash-ink">
        {label}
        {required ? <span className="text-dash-off-fg">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-[12.5px] text-dash-muted">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 text-[12.5px] font-medium text-dash-off-fg">{error}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "mt-2 h-9.5 w-full rounded-[10px] border border-dash-line bg-dash-surface px-3 text-[13.5px] text-dash-ink outline-none transition-colors placeholder:text-dash-muted focus-visible:border-dash-accent";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-dash-bg text-dash-muted">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-dash-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-[46ch] text-[13px] text-dash-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function PageHead({
  date,
  title,
  sub,
  actions,
}: {
  date: string;
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
      <div>
        <p className="text-[12.5px] text-dash-muted">{date}</p>
        <h1 className="mt-1.5 text-[26px] leading-tight font-bold tracking-[-0.03em] text-dash-ink sm:text-[30px]">
          {title}
        </h1>
        {sub ? <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-dash-muted">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const map: Record<Tone, string> = {
    ok: "bg-dash-ok-bg text-dash-ok-fg",
    wait: "bg-dash-wait-bg text-dash-wait-fg",
    info: "bg-dash-soft text-dash-fill-hover",
    off: "bg-dash-off-bg text-dash-off-fg",
    warn: "bg-dash-warn-bg text-dash-warn-fg",
    neutral: "bg-dash-bg text-dash-muted",
  };
  return (
    <p
      role={tone === "off" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium ${map[tone]}`}
    >
      <Icon
        name={tone === "off" ? "alert" : tone === "ok" ? "checkCircle" : "info"}
        className="mt-0.5 h-4 w-4"
      />
      <span>{children}</span>
    </p>
  );
}
