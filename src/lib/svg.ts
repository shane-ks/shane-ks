/**
 * Sanitize a model-generated SVG so it is safe to store, download, and render.
 * Logos are additionally rendered via <img src="data:image/svg+xml,…"> on the
 * client (which cannot execute scripts), but we still strip dangerous content
 * here so the stored/downloaded copy is safe on its own.
 */

const MAX_SVG_BYTES = 24_000;

// Block-level dangerous elements (with their content).
const DANGEROUS_BLOCKS = /<\s*(script|foreignObject|iframe|object|embed|use|set|animate[a-z]*)\b[\s\S]*?<\/\s*\1\s*>/gi;
// Self-closing variants of the same.
const DANGEROUS_SELF_CLOSING = /<\s*(script|foreignObject|iframe|object|embed|use|image|set|animate[a-z]*)\b[^>]*\/?>/gi;

export function sanitizeSvg(input: string): string {
  let svg = String(input ?? "");

  // Keep only the <svg>…</svg> portion if the model added prose around it.
  const match = svg.match(/<svg[\s\S]*<\/svg>/i);
  if (match) svg = match[0];

  svg = svg
    .replace(DANGEROUS_BLOCKS, "")
    .replace(DANGEROUS_SELF_CLOSING, "")
    // Strip inline event handlers: onclick=, onload=, etc.
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    // Strip links / external references entirely (logos don't need them).
    .replace(/\s(?:xlink:href|href)\s*=\s*"[^"]*"/gi, "")
    .replace(/\s(?:xlink:href|href)\s*=\s*'[^']*'/gi, "")
    // Neutralize any javascript: / data: protocols that slipped through.
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");

  return svg.trim();
}

/** True if the string looks like a single, non-empty, size-bounded SVG. */
export function isValidSvg(svg: string): boolean {
  if (!svg) return false;
  if (svg.length > MAX_SVG_BYTES) return false;
  const s = svg.trim();
  return /^<svg[\s>]/i.test(s) && /<\/svg>\s*$/i.test(s);
}

/** Encode an SVG as a data URI suitable for <img src> or a download link. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
