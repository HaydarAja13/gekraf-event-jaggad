import assert from "node:assert/strict";
import test from "node:test";
import { formatIdr, normalizeReferralCode, payableAmount, referralDetail, validReferralCode } from "./referral.ts";

test("kode dinormalisasi dan divalidasi", () => {
  assert.equal(normalizeReferralCode("  bsm 10 "), "BSM10");
  assert.equal(validReferralCode("BSM10"), true);
  assert.equal(validReferralCode("A"), false);
  assert.equal(validReferralCode("KODE SPASI"), false);
});

test("potongan tidak membuat nominal di bawah nol", () => {
  assert.equal(payableAmount(999000, 100000), 899000);
  assert.equal(payableAmount(50000, 100000), 0);
  assert.equal(formatIdr(899000), "Rp 899.000");
});

test("transaksi tanpa kode tetap terbaca", () => {
  assert.equal(
    referralDetail({ referralCode: null, referralName: null, discountAmount: 0 }),
    "Tidak memakai kode referral",
  );
  assert.match(referralDetail({ referralCode: "BSM10", referralName: "Komunitas", discountAmount: 100000 }), /Komunitas/);
});
