export type OrderStatus = "pending" | "approved" | "rejected";

export type PlanSlot = { name: string; slots: string };

export function slotFull(slots: string, used: number) {
  const n = Number.parseInt(slots, 10);
  if (!Number.isFinite(n) || n < 0) return true;
  return used >= n;
}

export function countUsed(orders: { plan: string; status: OrderStatus }[], plan: string) {
  return orders.filter((order) => order.plan === plan && order.status !== "rejected").length;
}

export function remainingSlots(slots: string, used: number) {
  const n = Number.parseInt(slots, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.max(0, n - used);
}

/** Paket ke-i hanya terbuka kalau semua paket sebelumnya sudah habis. */
export function planState(plans: PlanSlot[], taken: Record<string, number>, index: number) {
  const plan = plans[index];
  if (!plan) return { open: false, full: true, left: 0, locked: true as const };
  const used = taken[plan.name] ?? 0;
  const left = remainingSlots(plan.slots, used);
  const full = slotFull(plan.slots, used);
  let previousFull = true;
  for (let i = 0; i < index; i++) {
    const prev = plans[i];
    if (!slotFull(prev.slots, taken[prev.name] ?? 0)) {
      previousFull = false;
      break;
    }
  }
  const locked = !previousFull;
  const open = previousFull && !full;
  return { open, full, left, locked };
}

export function makeTicketNo() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return `BSM-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
