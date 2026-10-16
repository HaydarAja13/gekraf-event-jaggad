import { Suspense } from "react";
import Link from "next/link";
import { listSales } from "@/lib/sales";
import { countUsed, planState } from "@/lib/slots";
import { getAdmin } from "@/lib/auth";
import { getSite, sectionStatus } from "@/lib/site";
import {
  Avatar,
  BtnLink,
  Card,
  CardHead,
  EmptyState,
  Icon,
  Meta,
  OrderStatus,
  PageHead,
  Pill,
  Progress,
  StatStrip,
  TableShell,
  Td,
} from "./ui";
import { MenuButton, ProofPreview } from "./menu";
import { greeting, shortDate, timeOfDay, todayLine } from "./greeting";

export default function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  return (
    <Suspense fallback={<HomeFallback />}>
      <Home searchParams={searchParams} />
    </Suspense>
  );
}

function HomeFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-48 rounded-lg bg-dash-line-soft" />
      <div className="h-11 w-full max-w-md rounded-full bg-dash-surface" />
      <div className="h-64 rounded-[14px] border border-dash-line bg-dash-surface" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-[14px] border border-dash-line bg-dash-surface" />
        <div className="h-72 rounded-[14px] border border-dash-line bg-dash-surface" />
      </div>
    </div>
  );
}

async function Home({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const query = await searchParams;
  const [site, db, admin] = await Promise.all([getSite(), listSales(), getAdmin()]);
  const orders = db.orders;

  const pending = orders.filter((order) => order.status === "pending").length;
  const approved = orders.filter((order) => order.status === "approved").length;
  const left = site.pricing.plans.reduce((sum, plan) => {
    const slots = Number.parseInt(plan.slots, 10);
    const used = countUsed(orders, plan.name);
    return sum + Math.max(0, (Number.isFinite(slots) ? slots : 0) - used);
  }, 0);

  const content = sectionStatus(site);
  const filled = content.reduce((sum, item) => sum + item.filled, 0);
  const totalFields = content.reduce((sum, item) => sum + item.total, 0);
  const emptySections = content.filter((item) => !item.complete);
  const customers = new Set(orders.map((order) => order.email.toLowerCase())).size;

  const plans = site.pricing.plans;
  const selected = plans.find((plan) => plan.name === query.paket) ?? plans[0] ?? null;
  const selectedIndex = selected ? plans.findIndex((plan) => plan.name === selected.name) : -1;
  const taken: Record<string, number> = {};
  for (const order of orders) {
    if (order.status === "rejected") continue;
    taken[order.plan] = (taken[order.plan] ?? 0) + 1;
  }
  const state = selectedIndex >= 0 ? planState(plans, taken, selectedIndex) : null;
  const selectedBuyers = selected
    ? orders.filter((order) => order.plan === selected.name).slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub={
          pending > 0
            ? `Ada ${pending} pembayaran menunggu persetujuan. Sisa ${left} kursi dari ${plans.length} paket.`
            : `Tidak ada pembayaran yang menunggu. Sisa ${left} kursi dari ${plans.length} paket.`
        }
        actions={
          <>
            <BtnLink href="/" icon="external" target="_blank" rel="noreferrer">
              Lihat situs
            </BtnLink>
            <BtnLink href="/dashboard/pricing" icon="ticket">
              Harga &amp; slot
            </BtnLink>
          </>
        }
      />

      <StatStrip
        items={[
          { icon: "clock", value: String(pending), label: "Menunggu ACC" },
          { icon: "checkCircle", value: String(approved), label: "Tiket terbit" },
          { icon: "ticket", value: String(left), label: "Slot tersisa" },
          { icon: "users", value: String(customers), label: "Customer" },
        ]}
      />

      <Card>
        <CardHead
          icon="receipt"
          title="Transaksi terbaru"
          meta={<Pill tone="neutral">{orders.length} total</Pill>}
          right={
            <BtnLink href="/dashboard/transaksi" size="sm" trailingIcon="chevronRight">
              Lihat semua
            </BtnLink>
          }
        />
        <TableShell
          minWidth="860px"
          cols={[
            { key: "peserta", label: "Peserta", width: "34%" },
            { key: "paket", label: "Paket", width: "24%" },
            { key: "bukti", label: "Bukti", width: "104px" },
            { key: "status", label: "Status", width: "180px" },
          ]}
        >
          {orders.slice(0, 6).map((order) => (
            <tr key={order.id}>
              <Td>
                <span className="flex items-center gap-2.5">
                  <Avatar name={order.fullName} size={30} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-dash-ink">{order.fullName}</span>
                    <Meta>{order.email}</Meta>
                  </span>
                </span>
              </Td>
              <Td>
                <span className="block font-medium">{order.plan}</span>
                <Meta>
                  {order.amount}
                  {order.ticketNo ? ` · ${order.ticketNo}` : ""}
                </Meta>
              </Td>
              <Td>
                <ProofPreview
                  src={`/dashboard/bukti/${order.id}`}
                  name={`${order.fullName} · ${order.plan}`}
                />
              </Td>
              <Td>
                <OrderStatus status={order.status} short />
                <Meta>
                  {shortDate(order.createdAt)} {timeOfDay(order.createdAt)}
                </Meta>
              </Td>
            </tr>
          ))}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <EmptyState
                  icon="receipt"
                  title="Belum ada transaksi masuk"
                  body="Setiap pendaftaran dari halaman checkout akan muncul di sini dengan bukti transfernya, siap Anda ACC."
                  action={<BtnLink href="/" size="sm" icon="external">Buka halaman pendaftaran</BtnLink>}
                />
              </td>
            </tr>
          ) : null}
        </TableShell>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead
            icon="ticket"
            title="Slot paket"
            right={
              <MenuButton
                label=""
                icon="dots"
                variant="ghost"
                ariaLabel="Menu slot paket"
                items={[
                  { label: "Edit harga & slot", href: "/dashboard/pricing", icon: "ticket" },
                  { label: "Lihat semua transaksi", href: "/dashboard/transaksi", icon: "receipt" },
                  { label: "Halaman pendaftaran", href: "/", icon: "external" },
                ]}
              />
            }
          />

          <div className="flex gap-1.5 px-[var(--dash-gutter)] pb-3.5">
            {plans.map((plan) => {
              const used = countUsed(orders, plan.name);
              const total = Number.parseInt(plan.slots, 10) || 0;
              const active = plan.name === selected?.name;
              const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 100;
              return (
                <Link
                  key={plan.name}
                  href={`/dashboard?paket=${encodeURIComponent(plan.name)}`}
                  aria-current={active ? "true" : undefined}
                  className={`min-w-0 flex-1 rounded-[10px] border px-3 py-2.5 transition-colors ${
                    active
                      ? "border-transparent bg-dash-fill text-white"
                      : "border-dash-line text-dash-ink hover:bg-dash-bg"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`min-w-0 truncate text-[11.5px] font-semibold tracking-[0.06em] ${
                        active ? "text-white" : "text-dash-muted"
                      }`}
                    >
                      {plan.name}
                    </span>
                    <span className="tnum shrink-0 text-[14px] font-bold">
                      {used}/{plan.slots}
                    </span>
                  </span>
                  <span
                    className={`mt-2 block h-1.5 overflow-hidden rounded-full ${
                      active ? "bg-white/25" : "bg-dash-track"
                    }`}
                  >
                    <span
                      className={`block h-full rounded-full ${active ? "bg-white" : "bg-dash-accent"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </Link>
              );
            })}
          </div>

          {selected && state ? (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-dash-line-soft bg-dash-bg px-[var(--dash-gutter)] py-3">
                <Progress
                  used={taken[selected.name] ?? 0}
                  total={Number.parseInt(selected.slots, 10) || 0}
                />
                <span className="ml-auto flex items-center gap-2">
                  <Pill tone={state.locked ? "neutral" : state.full ? "off" : "ok"}>
                    {state.locked ? "Terkunci" : state.full ? "Habis" : `Sisa ${state.left}`}
                  </Pill>
                  <span className="text-[12.5px] text-dash-muted">
                    {selected.price} · <s className="text-dash-muted">{selected.priceWas}</s>
                  </span>
                </span>
              </div>
              <ul className="divide-y divide-dash-line-soft">
                {selectedBuyers.map((order) => (
                  <li key={order.id} className="flex items-center gap-3 px-[var(--dash-gutter)] py-2.5">
                    <Avatar name={order.fullName} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-dash-ink">
                        {order.fullName}
                      </span>
                      <Meta>
                        {order.institution || order.email} · {timeOfDay(order.createdAt)}
                      </Meta>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block">
                      <span className="tnum block text-[13px] font-semibold text-dash-ink">
                        {order.amount}
                      </span>
                      <Meta>{shortDate(order.createdAt)}</Meta>
                    </span>
                    <OrderStatus status={order.status} short />
                  </li>
                ))}
                {selectedBuyers.length === 0 ? (
                  <li>
                    <EmptyState
                      icon="ticket"
                      title={`Belum ada peserta paket ${selected.name}`}
                      body="Begitu ada pendaftaran untuk paket ini, pembelinya muncul di sini dengan status ACC-nya."
                    />
                  </li>
                ) : null}
              </ul>
            </>
          ) : (
            <EmptyState
              icon="ticket"
              title="Belum ada paket tiket"
              body="Tambahkan paket dan harga di bagian Harga agar halaman pendaftaran bisa menampilkan tiketnya."
              action={<BtnLink href="/dashboard/pricing" size="sm" icon="ticket">Atur paket</BtnLink>}
            />
          )}
        </Card>

        <Card>
          <CardHead
            icon="book"
            title="Kelengkapan konten"
            meta={
              <Pill tone={emptySections.length === 0 ? "ok" : "warn"}>
                {filled}/{totalFields} kolom terisi
              </Pill>
            }
          />
          <ul className="divide-y divide-dash-line-soft border-t border-dash-line-soft sm:columns-2 sm:gap-x-6">
            {content.map((section) => (
              <li key={section.id} className="break-inside-avoid">
                <Link
                  href={`/dashboard/${section.id}`}
                  className="flex items-center gap-3 px-[var(--dash-gutter)] py-3 transition-colors hover:bg-dash-bg"
                >
                  <Icon
                    name={section.complete ? "checkCircle" : "circle"}
                    className={`h-[18px] w-[18px] ${section.complete ? "text-dash-ok-fg" : "text-dash-faint"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-dash-ink">
                      {section.label}
                    </span>
                    <Meta>
                      {section.complete
                        ? "Terisi lengkap"
                        : `${section.empty} dari ${section.total} kolom masih kosong`}
                    </Meta>
                  </span>
                  <Icon name="chevronRight" className="h-4 w-4 text-dash-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
