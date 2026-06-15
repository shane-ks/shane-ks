import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CREDIT_PACKS,
  getPack,
  formatUsd,
  perCreditLabel,
  FREE_SIGNUP_CREDITS,
} from "../src/lib/credits";

test("every pack is priced above target cost-of-goods", () => {
  // Target COGS per search with the web-search cap in place (~$0.20-0.25
  // typical). Every tier must keep a margin over this.
  const TARGET_COST_PER_CREDIT = 0.3;
  for (const pack of CREDIT_PACKS) {
    const perCredit = pack.priceCents / 100 / pack.credits;
    assert.ok(
      perCredit >= TARGET_COST_PER_CREDIT,
      `${pack.id} sells credits at $${perCredit.toFixed(2)}, below target COGS`,
    );
  }
});

test("pack ids are unique", () => {
  const ids = CREDIT_PACKS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("getPack resolves known packs and rejects unknown ones", () => {
  assert.equal(getPack("pro")?.id, "pro");
  assert.equal(getPack("does-not-exist"), undefined);
  assert.equal(getPack(""), undefined);
});

test("exactly one pack is badged as the highlight", () => {
  assert.equal(CREDIT_PACKS.filter((p) => p.badge).length, 1);
});

test("formatUsd renders whole and fractional dollars", () => {
  assert.equal(formatUsd(500), "$5");
  assert.equal(formatUsd(1500), "$15");
  assert.equal(formatUsd(1599), "$15.99");
});

test("perCreditLabel computes the unit price", () => {
  assert.equal(perCreditLabel({ ...getPack("starter")! }), "$0.50 / credit");
});

test("free signup credits are positive", () => {
  assert.ok(FREE_SIGNUP_CREDITS > 0);
});
