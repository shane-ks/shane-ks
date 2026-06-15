import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CREDIT_PACKS,
  getPack,
  formatUsd,
  perCreditLabel,
  FREE_SIGNUP_CREDITS,
  NAME_CREDIT_COST,
  LOGO_CREDIT_COST,
} from "../src/lib/credits";

const perCredit = (id: string) => {
  const p = getPack(id)!;
  return p.priceCents / 100 / p.credits;
};

test("no pack sells a credit below the irreducible search cost", () => {
  // The web-search portion alone (cap of ~10 searches × $0.01) is the floor we
  // can never price under, regardless of model.
  const HARD_FLOOR = 0.1;
  for (const pack of CREDIT_PACKS) {
    assert.ok(
      pack.priceCents / 100 / pack.credits > HARD_FLOOR,
      `${pack.id} priced at/below the hard search-cost floor`,
    );
  }
});

test("entry tiers keep margin above typical COGS (Opus 4.8)", () => {
  // Typical all-in COGS per search on Opus 4.8 with the web-search cap.
  // The bulk Studio tier is deliberately thinner and excluded here.
  const TYPICAL_COGS = 0.3;
  assert.ok(perCredit("starter") >= TYPICAL_COGS);
  assert.ok(perCredit("pro") >= TYPICAL_COGS);
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

test("per-action credit costs are sane", () => {
  assert.ok(NAME_CREDIT_COST >= 1);
  // A brand kit is a richer deliverable than a name search.
  assert.ok(LOGO_CREDIT_COST >= NAME_CREDIT_COST);
  // A new account can afford at least one action with its free credits.
  assert.ok(FREE_SIGNUP_CREDITS >= NAME_CREDIT_COST);
});
