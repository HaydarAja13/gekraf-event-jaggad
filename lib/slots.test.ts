import assert from "node:assert/strict";
import test from "node:test";
import { countUsed, makeTicketNo, planState, slotFull } from "./slots.ts";

const plans = [
  { name: "EARLYBIRD", slots: "2" },
  { name: "NORMAL", slots: "2" },
  { name: "LAST CALL", slots: "2" },
];

test("awal hanya early bird yang terbuka", () => {
  const taken = {};
  assert.equal(planState(plans, taken, 0).open, true);
  assert.equal(planState(plans, taken, 1).locked, true);
  assert.equal(planState(plans, taken, 1).open, false);
  assert.equal(planState(plans, taken, 2).locked, true);
});

test("normal terbuka setelah early bird habis", () => {
  const taken = { EARLYBIRD: 2 };
  assert.equal(planState(plans, taken, 0).full, true);
  assert.equal(planState(plans, taken, 0).open, false);
  assert.equal(planState(plans, taken, 1).open, true);
  assert.equal(planState(plans, taken, 1).left, 2);
  assert.equal(planState(plans, taken, 2).locked, true);
});

test("last call terbuka setelah normal habis", () => {
  const taken = { EARLYBIRD: 2, NORMAL: 2 };
  assert.equal(planState(plans, taken, 2).open, true);
});

test("slot penuh tidak bisa dipesan lagi", () => {
  assert.equal(slotFull("2", 2), true);
  assert.equal(slotFull("2", 1), false);
});

test("pesanan ditolak tidak memakai slot", () => {
  const used = countUsed(
    [
      { plan: "EARLYBIRD", status: "pending" },
      { plan: "EARLYBIRD", status: "approved" },
      { plan: "EARLYBIRD", status: "rejected" },
    ],
    "EARLYBIRD",
  );
  assert.equal(used, 2);
});

test("nomor tiket punya awalan tetap", () => {
  assert.match(makeTicketNo(), /^BSM-[0-9A-F]{8}$/);
});
