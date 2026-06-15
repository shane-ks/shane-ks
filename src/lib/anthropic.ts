import Anthropic from "@anthropic-ai/sdk";
import type { NameResult } from "./types";
import { clampConfidence, cleanEvidence, normalizeStatus, parseJson } from "./parse";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

// Hard cap on web searches per research call. Each search costs ~$0.01, so this
// bounds the cost-of-goods per credit. Tune alongside pricing in lib/credits.ts.
const MAX_SEARCHES = Number(process.env.ANTHROPIC_MAX_WEB_SEARCHES || 10);

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
  // De-duplicate case-insensitively while preserving order.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const raw of names) {
    const name = String(raw).trim();
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      unique.push(name);
    }
  }
  return unique.slice(0, count);
}

interface RawResearch {
  name: string;
  status?: string;
  confidence?: number;
  reasoning?: string;
  evidence?: { title?: string; url?: string }[];
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
        max_uses: MAX_SEARCHES,
      } satisfies Anthropic.Messages.WebSearchTool20250305,
    ],
    system:
      "You investigate whether a company/brand name is already in use. For " +
      "each name, search the web for an existing company, product, startup, " +
      "or registered brand using that exact name. A name is 'taken' if a " +
      "real, active organization clearly operates under it; 'available' if no " +
      "meaningful existing use is found; 'uncertain' if evidence is weak or " +
      "ambiguous. Only cite real URLs you actually found in search results. " +
      "Be efficient with searches — you have a limited search budget.",
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
      confidence: clampConfidence(r?.confidence),
      reasoning: r?.reasoning,
      evidence: cleanEvidence(r?.evidence),
    } satisfies NameResult;
  });
}
