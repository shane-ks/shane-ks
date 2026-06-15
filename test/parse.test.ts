import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseJson,
  normalizeStatus,
  cleanEvidence,
  clampConfidence,
} from "../src/lib/parse";

test("parseJson extracts a bare array", () => {
  assert.deepEqual(parseJson<string[]>('["Acme", "Zephyr"]'), ["Acme", "Zephyr"]);
});

test("parseJson extracts JSON from a fenced code block with prose", () => {
  const text = 'Here you go:\n```json\n[{"name":"Nova"}]\n```\nThanks!';
  assert.deepEqual(parseJson(text), [{ name: "Nova" }]);
});

test("parseJson extracts an object embedded in prose", () => {
  assert.deepEqual(parseJson('prefix {"a":1} suffix'), { a: 1 });
});

test("parseJson throws when there is no JSON", () => {
  assert.throws(() => parseJson("no json here"));
});

test("normalizeStatus maps variants to the canonical set", () => {
  assert.equal(normalizeStatus("available"), "available");
  assert.equal(normalizeStatus("Open"), "available");
  assert.equal(normalizeStatus("taken"), "taken");
  assert.equal(normalizeStatus("USED"), "taken");
  assert.equal(normalizeStatus("maybe"), "uncertain");
  assert.equal(normalizeStatus(undefined), "uncertain");
});

test("cleanEvidence drops non-http urls and caps at 5", () => {
  const evidence = cleanEvidence([
    { title: "A", url: "https://a.com" },
    { title: "B", url: "ftp://b.com" },
    { url: "not-a-url" },
    { url: "http://c.com" },
  ]);
  assert.equal(evidence.length, 2);
  assert.deepEqual(evidence[0], { title: "A", url: "https://a.com" });
  // Title falls back to the url when missing.
  assert.equal(evidence[1].title, "http://c.com");
});

test("cleanEvidence tolerates non-array input", () => {
  assert.deepEqual(cleanEvidence(undefined), []);
});

test("clampConfidence clamps to 0-100 and defaults to 50", () => {
  assert.equal(clampConfidence(150), 100);
  assert.equal(clampConfidence(-10), 0);
  assert.equal(clampConfidence(73.6), 74);
  assert.equal(clampConfidence("x"), 50);
});
