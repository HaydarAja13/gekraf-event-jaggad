"use client";

import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { useFormStatus } from "react-dom";
import { Icon, btnClass, type IconName } from "./ui";

/* Dropdown panel. Children are rendered as-is, so a server component can pass
   links or forms straight in; the panel just closes on select or Escape. */
export function Menu({
  trigger,
  children,
  align = "right",
  width = 260,
  label,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: number;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function down(event: MouseEvent) {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    }
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  /* The aria-expanded/haspopup pair belongs on the button itself, so the
     trigger element is cloned with the toggle handler and the state. */
  let control: ReactNode = trigger;
  if (isValidElement(trigger)) {
    const own = (trigger.props as { onClick?: (event: React.MouseEvent) => void }).onClick;
    control = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
      "aria-expanded": open,
      "aria-haspopup": "menu",
      onClick: (event: React.MouseEvent) => {
        own?.(event);
        setOpen((value) => !value);
      },
    });
  }

  return (
    <div className="relative" ref={box}>
      <div>{control}</div>
      {open ? (
        <div
          role="menu"
          aria-label={label}
          className={`absolute top-[calc(100%+6px)] z-40 overflow-hidden rounded-[12px] border border-dash-line bg-dash-surface p-1.5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          style={{ width, maxWidth: "calc(100vw - 1rem)" }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({
  href,
  icon,
  children,
  danger = false,
  hint,
}: {
  href: string;
  icon?: IconName;
  children: ReactNode;
  danger?: boolean;
  hint?: string;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      className={`flex items-start gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-dash-bg ${
        danger ? "text-dash-off-fg" : "text-dash-ink"
      }`}
    >
      {icon ? <Icon name={icon} className="mt-0.5 h-4 w-4 text-dash-faint" /> : null}
      <span className="min-w-0">
        <span className="block">{children}</span>
        {hint ? <span className="mt-0.5 block text-[12px] text-dash-muted">{hint}</span> : null}
      </span>
    </Link>
  );
}

/* A data-driven trigger, for server components that cannot pass a function. */
export function MenuButton({
  label,
  icon,
  trailingIcon,
  variant = "outline",
  size = "md",
  items,
  children,
  align = "right",
  width = 260,
  ariaLabel,
}: {
  label: string;
  icon?: IconName;
  trailingIcon?: IconName;
  variant?: "primary" | "outline" | "ghost" | "danger" | "quiet";
  size?: "sm" | "md";
  items: { label: string; href: string; icon?: IconName; hint?: string; danger?: boolean }[];
  children?: ReactNode;
  align?: "left" | "right";
  width?: number;
  ariaLabel?: string;
}) {
  return (
    <Menu
      align={align}
      width={width}
      label={ariaLabel ?? label}
      trigger={
        <button type="button" className={btnClass(variant, size)} aria-label={ariaLabel}>
          {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
          {label ? <span>{label}</span> : null}
          {trailingIcon ? <Icon name={trailingIcon} className="h-4 w-4" /> : null}
        </button>
      }
    >
      {children}
      {items.map((item) => (
        <MenuItem
          key={item.href + item.label}
          href={item.href}
          icon={item.icon}
          hint={item.hint}
          danger={item.danger}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}

/* Search field for the top bar and tables. Submits as a GET form, so the query stays in
   the URL and the count next to the results stays honest. */
export function SearchBox({
  action = "/dashboard/transaksi",
  defaultValue = "",
  placeholder = "Cari peserta, email, atau nomor tiket",
}: {
  action?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const hint = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hint.current) {
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      hint.current.textContent = mac ? "⌘K" : "Ctrl K";
    }
    function key(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  return (
    <form action={action} className="relative min-w-0 flex-1">
      <SearchField input={input} hint={hint} defaultValue={defaultValue} placeholder={placeholder} />
    </form>
  );
}

function SearchField({
  input,
  hint,
  defaultValue,
  placeholder,
}: {
  input: RefObject<HTMLInputElement | null>;
  hint: RefObject<HTMLElement | null>;
  defaultValue: string;
  placeholder: string;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dash-faint"
      />
      <input
        ref={input}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={pending ? "Mencari…" : placeholder}
        aria-label={placeholder}
        aria-busy={pending}
        disabled={pending}
        className="h-9.5 w-full rounded-[10px] border border-dash-line bg-dash-bg pr-16 pl-9 text-[13.5px] text-dash-ink outline-none transition-colors placeholder:text-dash-muted focus-visible:border-dash-accent focus-visible:bg-dash-surface disabled:cursor-wait"
      />
      {pending ? (
        <span className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-dash-muted border-r-transparent" />
      ) : (
        <kbd
          ref={hint}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md border border-dash-line bg-dash-surface px-1.5 py-0.5 text-[11px] font-semibold text-dash-muted"
        >
          Ctrl K
        </kbd>
      )}
    </>
  );
}

/* Destructive action held behind one inline confirmation instead of a modal. */
export function InlineConfirm({
  trigger,
  confirm,
  cancelLabel = "Batal",
}: {
  trigger: ReactNode;
  confirm: ReactNode;
  cancelLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  const id = useId();

  if (!armed) {
    return (
      <span onClick={() => setArmed(true)} onKeyDown={(event) => event.key === "Enter" && setArmed(true)}>
        {trigger}
      </span>
    );
  }

  return (
    <span className="flex items-center justify-end gap-2">
      {confirm}
      <button
        type="button"
        id={id}
        onClick={() => setArmed(false)}
        className={btnClass("ghost", "sm")}
      >
        {cancelLabel}
      </button>
    </span>
  );
}

/* Copy-to-clipboard for values an operator retypes often, such as an account
   number or ticket code. Falls back to a plain message when the browser refuses access. */
export function CopyButton({
  value,
  label = "Salin",
  iconOnly = false,
  className = "",
}: {
  value: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy(event: React.MouseEvent) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1600);
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={copy}
        title={state === "done" ? "Tersalin!" : `${label}: ${value}`}
        aria-label={`${label} ${value}`}
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dash-line-soft bg-dash-surface text-dash-muted transition-colors hover:border-dash-line hover:bg-dash-bg hover:text-dash-ink ${
          state === "done" ? "border-dash-ok-fg/40 bg-dash-ok-bg text-dash-ok-fg" : ""
        } ${className}`}
      >
        <Icon
          name={state === "done" ? "check" : state === "failed" ? "alert" : "copy"}
          className="h-3.5 w-3.5"
        />
        <span className="sr-only">{state === "done" ? "Tersalin" : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`${btnClass("ghost", "sm")} ${className}`}
      aria-label={`${label} ${value}`}
    >
      <Icon name={state === "done" ? "check" : state === "failed" ? "alert" : "copy"} className="h-3.5 w-3.5" />
      {state === "done" ? "Tersalin" : state === "failed" ? "Gagal salin" : label}
    </button>
  );
}

/* Dedicated ticket badge prominently displayed at the front of tables.
   Highlighted, bold, monospace, links to public ticket page when active, and has inline copy. */
export function TicketBadge({
  ticketNo,
  status,
  size = "md",
  withCopy = false,
}: {
  ticketNo?: string | null;
  status?: string;
  size?: "sm" | "md";
  withCopy?: boolean;
}) {
  // If transaction was rejected: ticket is void / cancelled
  if (status === "rejected") {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-dash-muted"
        title={ticketNo ? `Transaksi ditolak, tiket dibatalkan (${ticketNo})` : "Tidak diterbitkan"}
      >
        <span className="line-through opacity-50">{ticketNo || "—"}</span>
        <span className="rounded bg-dash-off-bg px-1.5 py-0.5 text-[10.5px] font-semibold text-dash-off-fg">
          Batal
        </span>
      </span>
    );
  }

  // If pending: waiting for ACC
  if (status === "pending") {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-dash-wait-fg/20 bg-dash-wait-bg px-2 py-0.5 text-[11.5px] font-semibold text-dash-wait-fg"
          title="Tiket akan terbit resmi dan aktif setelah pembayaran di-ACC"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-dash-wait-fg animate-pulse" />
          <span>Menunggu ACC</span>
        </span>
        {ticketNo ? (
          <span
            className="font-mono text-[11px] text-dash-muted"
            title="Nomor alokasi: aktif setelah ACC"
          >
            ({ticketNo})
          </span>
        ) : null}
      </span>
    );
  }

  // If approved: ticket is active, bold and highlighted
  if (ticketNo) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Link
          href={`/tiket/${encodeURIComponent(ticketNo)}`}
          target="_blank"
          rel="noreferrer"
          title="Buka halaman tiket peserta (tab baru)"
          className={`group inline-flex items-center gap-1.5 rounded-lg border border-dash-fill/30 bg-dash-soft font-mono font-extrabold tracking-wider text-dash-fill shadow-xs transition-all hover:border-dash-fill hover:bg-dash-fill hover:text-white ${
            size === "sm" ? "px-2 py-0.5 text-[12px]" : "px-2.5 py-1 text-[13px]"
          }`}
        >
          <Icon name="ticket" className="h-3.5 w-3.5 opacity-80 transition group-hover:text-white" />
          <span>{ticketNo}</span>
          <Icon name="external" className="h-3 w-3 opacity-50 transition group-hover:opacity-100" />
        </Link>
        {withCopy ? <CopyButton value={ticketNo} label="Salin nomor tiket" iconOnly /> : null}
      </span>
    );
  }

  return <span className="font-mono text-[12.5px] text-dash-muted">—</span>;
}

/* Image inspection for a transfer proof. Escape closes, the page behind
   cannot scroll while it is open. */
export function ProofPreview({
  src,
  name,
}: {
  src: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", key);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block overflow-hidden rounded-[9px] border border-dash-line"
      >
        <img
          src={src}
          alt={`Bukti pembayaran ${name}`}
          className="h-11 w-14 object-cover transition group-hover:opacity-90"
        />
        <span className="absolute inset-0 grid place-items-center bg-dash-ink/0 text-white opacity-0 transition group-hover:bg-dash-ink/45 group-hover:opacity-100">
          <Icon name="eye" className="h-4 w-4" />
        </span>
        <span className="sr-only">Perbesar bukti pembayaran {name}</span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Bukti pembayaran ${name}`}
          className="fixed inset-0 z-50 grid place-items-center bg-dash-ink/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-[min(880px,100%)] overflow-auto rounded-[14px] border border-dash-line bg-dash-surface p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[13.5px] font-semibold text-dash-ink">Bukti pembayaran</p>
                <p className="text-[12.5px] text-dash-muted">{name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className={btnClass("outline", "sm")}
                >
                  <Icon name="external" className="h-4 w-4" />
                  Buka tab baru
                </a>
                <button type="button" className={btnClass("quiet", "sm")} onClick={() => setOpen(false)}>
                  Tutup
                </button>
              </div>
            </div>
            <img
              src={src}
              alt={`Bukti pembayaran ${name}`}
              className="max-h-[74vh] w-full rounded-[10px] bg-dash-bg object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
