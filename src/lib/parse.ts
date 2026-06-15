import type { Evidence, NameStatus } from "./types";

/** Best-effort extraction of a JSON value embedded in model prose. */
export function parseJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  // Find the outermost array or object.
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model response");
  const open = candidate[start];
  const close = open === "[" ? "]" : "}";
  const end = candidate.lastIndexOf(close);
  if (end === -1) throw new Error("Malformed JSON in model response");
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

export function normalizeStatus(s?: string): NameStatus {
  const v = (s || "").toLowerCase();
  if (v.startsWith("avail") || v === "free" || v === "open") return "available";
  if (v.startsWith("tak") || v === "used" || v === "unavailable")
    return "taken";
  return "uncertain";
}

export function cleanEvidence(
  e?: { title?: string; url?: string }[],
): Evidence[] {
  if (!Array.isArray(e)) return [];
  return e
    .filter((x) => x && typeof x.url === "string" && /^https?:\/\//.test(x.url))
    .map((x) => ({ title: (x.title || x.url || "").trim(), url: x.url!.trim() }))
    .slice(0, 5);
}

export function clampConfidence(c: unknown): number {
  return typeof c === "number" ? Math.max(0, Math.min(100, Math.round(c))) : 50;
}
