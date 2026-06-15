import Anthropic from "@anthropic-ai/sdk";
import { parseJson } from "./parse";
import { sanitizeSvg, isValidSvg } from "./svg";
import type { BrandKit, LogoConcept, PaletteColor } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  });
}

function extractText(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

interface RawKit {
  palette?: { name?: string; hex?: string }[];
  fonts?: { heading?: string; body?: string };
  concepts?: { style?: string; rationale?: string; svg?: string }[];
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function cleanPalette(p?: { name?: string; hex?: string }[]): PaletteColor[] {
  if (!Array.isArray(p)) return [];
  return p
    .filter((c) => c && typeof c.hex === "string" && HEX.test(c.hex.trim()))
    .map((c) => ({
      name: (c.name || "").toString().trim() || c.hex!.trim(),
      hex: c.hex!.trim().toLowerCase(),
    }))
    .slice(0, 6);
}

function cleanConcepts(
  c?: { style?: string; rationale?: string; svg?: string }[],
): LogoConcept[] {
  if (!Array.isArray(c)) return [];
  const out: LogoConcept[] = [];
  for (const item of c) {
    if (!item || typeof item.svg !== "string") continue;
    const svg = sanitizeSvg(item.svg);
    if (!isValidSvg(svg)) continue;
    out.push({
      style: (item.style || "Concept").toString().trim().slice(0, 40),
      rationale: item.rationale
        ? item.rationale.toString().trim().slice(0, 200)
        : undefined,
      svg,
    });
    if (out.length >= 4) break;
  }
  return out;
}

/**
 * Generate a brand kit (logo concepts + palette + font pairing) for a name.
 * Produces self-contained vector (SVG) logos — no external assets — so output
 * is crisp, editable, downloadable, and cheap/predictable on tokens.
 */
export async function generateBrandKit(
  name: string,
  style: string,
): Promise<BrandKit> {
  const styleLine = style ? ` Style direction from the user: "${style}".` : "";

  const message = await client().messages.create({
    model: MODEL,
    max_tokens: 8000,
    system:
      "You are a senior brand identity designer. You craft clean, modern, " +
      "distinctive logo systems and brand kits. You output crisp, fully " +
      "self-contained SVG logos with no external assets and no scripts.",
    messages: [
      {
        role: "user",
        content:
          `Design a brand identity for a company named "${name}".${styleLine}\n\n` +
          "Return ONLY JSON (no prose) with exactly this shape:\n" +
          "{\n" +
          '  "palette": [{"name":"Ink","hex":"#0f172a"}, … 4-5 colors],\n' +
          '  "fonts": {"heading":"<Google font>","body":"<Google font>"},\n' +
          '  "concepts": [{"style":"<label e.g. Wordmark, Monogram, Emblem, Abstract mark>","rationale":"<one short sentence>","svg":"<complete standalone SVG>"} … exactly 4]\n' +
          "}\n\n" +
          "SVG rules (strict): root `<svg xmlns=\"http://www.w3.org/2000/svg\" " +
          'viewBox="0 0 256 256" width="256" height="256">`; no <script>, ' +
          "no <foreignObject>, no <image>, no external hrefs; inline fills " +
          "only; transparent or solid background. Give the 4 concepts visibly " +
          "different directions (a clean wordmark, a monogram/lettermark, an " +
          "icon+text lockup, and an abstract symbol). Where you render the " +
          "company name as text, use crisp <text> with a sensible font-family. " +
          "Keep each SVG under 4KB.",
      },
    ],
  });

  const raw = parseJson<RawKit>(extractText(message));
  const concepts = cleanConcepts(raw.concepts);
  if (concepts.length === 0) {
    throw new Error("no valid logo concepts produced");
  }

  return {
    name,
    palette: cleanPalette(raw.palette),
    fonts: {
      heading: (raw.fonts?.heading || "Inter").toString().trim().slice(0, 60),
      body: (raw.fonts?.body || "Inter").toString().trim().slice(0, 60),
    },
    concepts,
  } satisfies BrandKit;
}
