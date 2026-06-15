import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeSvg, isValidSvg, svgToDataUri } from "../src/lib/svg";

test("sanitizeSvg strips <script> blocks", () => {
  const dirty = `<svg viewBox="0 0 10 10"><script>alert(1)</script><rect/></svg>`;
  const clean = sanitizeSvg(dirty);
  assert.ok(!/script/i.test(clean));
  assert.ok(/<rect/.test(clean));
});

test("sanitizeSvg strips inline event handlers", () => {
  const dirty = `<svg onload="steal()" viewBox="0 0 10 10"><rect onclick='x()'/></svg>`;
  const clean = sanitizeSvg(dirty);
  assert.ok(!/onload/i.test(clean));
  assert.ok(!/onclick/i.test(clean));
});

test("sanitizeSvg removes external references and foreignObject", () => {
  const dirty =
    `<svg viewBox="0 0 10 10">` +
    `<foreignObject><iframe src="https://evil.com"></iframe></foreignObject>` +
    `<image href="https://evil.com/x.png"/>` +
    `<a href="javascript:alert(1)"><text>Hi</text></a>` +
    `</svg>`;
  const clean = sanitizeSvg(dirty);
  assert.ok(!/foreignObject/i.test(clean));
  assert.ok(!/iframe/i.test(clean));
  assert.ok(!/<image/i.test(clean));
  assert.ok(!/href=/i.test(clean));
  assert.ok(!/javascript:/i.test(clean));
});

test("sanitizeSvg keeps only the svg element when prose surrounds it", () => {
  const dirty = `Here is your logo:\n<svg viewBox="0 0 10 10"><circle/></svg>\nEnjoy!`;
  const clean = sanitizeSvg(dirty);
  assert.ok(clean.startsWith("<svg"));
  assert.ok(clean.endsWith("</svg>"));
});

test("isValidSvg accepts a real svg and rejects junk/oversized", () => {
  assert.ok(isValidSvg(`<svg viewBox="0 0 1 1"><rect/></svg>`));
  assert.ok(!isValidSvg("not an svg"));
  assert.ok(!isValidSvg(""));
  assert.ok(!isValidSvg("<svg>" + "x".repeat(30000) + "</svg>"));
});

test("svgToDataUri produces an encoded image data uri", () => {
  const uri = svgToDataUri(`<svg viewBox="0 0 1 1"></svg>`);
  assert.ok(uri.startsWith("data:image/svg+xml;charset=utf-8,"));
  assert.ok(uri.includes("%3Csvg"));
});
