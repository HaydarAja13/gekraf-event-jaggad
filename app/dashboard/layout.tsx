import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { listSales } from "@/lib/sales";
import { getSite } from "@/lib/site";
import { Shell } from "./shell";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="grid h-dvh place-items-center bg-dash-bg text-[14px] text-dash-muted">
          Memuat dashboard…
        </div>
      }
    >
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [site, sales] = await Promise.all([
    getSite(),
    listSales().catch(() => ({ accounts: [], orders: [], referrals: [] })),
  ]);
  const waiting = sales.orders.filter((order) => order.status === "pending");

  return (
    <Shell
      username={admin.username}
      brand={site.navbar.brand}
      logo={site.navbar.logoSrc}
      pending={waiting.length}
      waiting={waiting.slice(0, 4).map((order) => ({
        id: order.id,
        fullName: order.fullName,
        plan: order.plan,
      }))}
    >
      {children}
    </Shell>
  );
}
