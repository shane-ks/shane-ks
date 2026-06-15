import Anthropic from "@anthropic-ai/sdk";
import type { Evidence, NameResult, NameStatus } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
}

/** Pull the concatenated text out of an Anthropic message response. */
function extractText(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

/** Best-effort extraction of a JSON value embedded in model prose. */
function parseJson<T>(text: string): T {
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

/**
 * Brainstorm distinctive, brandable company names for a prompt.
 */
export async function brainstormNames(
  prompt: string,
  count = 8,
): Promise<string[]> {
  const message = await client().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "You are a world-class startup naming consultant. You invent short, " +
      "memorable, brandable company names. Favor coined/invented words, " +
      "evocative real words, and clever compounds. Avoid generic or " +
      "obviously-taken names. Names must be 1-2 words, easy to say and spell.",
    messages: [
      {
        role: "user",
        content:
          `Brainstorm ${count} distinctive company names for the following ` +
          `brief:\n\n"""${prompt}"""\n\n` +
          "Respond with ONLY a JSON array of strings (the names), no prose.",
      },
    ],
  });

  const names = parseJson<string[]>(extractText(message));
  return names
    .map((n) => String(n).trim())
    .filter(Boolean)
    .slice(0, count);
}

interface RawResearch {
  name: string;
  status?: string;
  confidence?: number;
  reasoning?: string;
  evidence?: { title?: string; url?: string }[];
}

function normalizeStatus(s?: string): NameStatus {
  const v = (s || "").toLowerCase();
  if (v.startsWith("avail") || v === "free" || v === "open") return "available";
  if (v.startsWith("tak") || v === "used" || v === "unavailable")
    return "taken";
  return "uncertain";
}

function cleanEvidence(e?: { title?: string; url?: string }[]): Evidence[] {
  if (!Array.isArray(e)) return [];
  return e
    .filter((x) => x && typeof x.url === "string" && /^https?:\/\//.test(x.url))
    .map((x) => ({ title: (x.title || x.url || "").trim(), url: x.url!.trim() }))
    .slice(0, 5);
}

/**
 * Research a batch of candidate names with live web search and classify each
 * as available / taken / uncertain, with evidence URLs for taken names.
 */
export async function researchNames(names: string[]): Promise<NameResult[]> {
  if (names.length === 0) return [];

  const message = await client().messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: Math.min(names.length * 2 + 2, 20),
      } satisfies Anthropic.Messages.WebSearchTool20250305,
    ],
    system:
      "You investigate whether a company/brand name is already in use. For " +
      "each name, search the web for an existing company, product, startup, " +
      "or registered brand using that exact name. A name is 'taken' if a " +
      "real, active organization clearly operates under it; 'available' if no " +
      "meaningful existing use is found; 'uncertain' if evidence is weak or " +
      "ambiguous. Only cite real URLs you actually found in search results.",
    messages: [
      {
        role: "user",
        content:
          "Research each of these candidate company names and decide if it is " +
          "already in use:\n\n" +
          names.map((n, i) => `${i + 1}. ${n}`).join("\n") +
          "\n\nAfter researching, respond with ONLY a JSON array. Each item " +
          "must be an object with keys: " +
          '"name" (string), ' +
          '"status" ("available" | "taken" | "uncertain"), ' +
          '"confidence" (integer 0-100), ' +
          '"reasoning" (one short sentence), ' +
          '"evidence" (array of {"title","url"} for existing companies found; ' +
          "empty array if available). Do not include any text outside the JSON.",
      },
    ],
  });

  const raw = parseJson<RawResearch[]>(extractText(message));
  const byName = new Map<string, RawResearch>();
  for (const item of raw) {
    if (item && item.name) byName.set(item.name.toLowerCase().trim(), item);
  }

  return names.map((name) => {
    const r = byName.get(name.toLowerCase().trim());
    return {
      name,
      status: normalizeStatus(r?.status),
      confidence:
        typeof r?.confidence === "number"
          ? Math.max(0, Math.min(100, Math.round(r.confidence)))
          : 50,
      reasoning: r?.reasoning,
      evidence: cleanEvidence(r?.evidence),
    } satisfies NameResult;
  });
}
