/** Stored codes are uppercase, with spaces removed. */
export function normalizeReferralCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function validReferralCode(code: string) {
  return /^[A-Z0-9][A-Z0-9-]{1,23}$/.test(code);
}

export function parseIdr(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatIdr(amount: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

/** What the buyer actually transfers. The cut cannot push the total below zero. */
export function payableAmount(listPrice: number, discount: number) {
  return Math.max(listPrice - discount, 0);
}

export function referralDetail(order: {
  referralCode: string | null;
  referralName: string | null;
  discountAmount: number;
}) {
  if (!order.referralCode) return "Tidak memakai kode referral";
  const name = order.referralName ?? order.referralCode;
  return `${name} · ${order.referralCode} · potongan ${formatIdr(order.discountAmount)}`;
}
