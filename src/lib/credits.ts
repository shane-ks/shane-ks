/**
 * Credit packs — the single, server-trusted source of truth for pricing.
 *
 * 1 credit = 1 search (one prompt → a batch of brandable names, each checked
 * for availability against the live web with evidence). New accounts get
 * FREE_SIGNUP_CREDITS to try the product.
 *
 * Prices are set above our cost-of-goods per search (Anthropic web search at
 * $10/1,000 plus Opus 4.8 tokens, ~$0.30–0.45/search) to keep a margin at every
 * tier — thinnest on the bulk Studio tier, which trades margin for volume.
 * NEVER trust a price or credit amount from the client — always resolve a pack
 * by id here on the server.
 */

export interface CreditPack {
  id: string;
  name: string;
  /** Price in US cents. */
  priceCents: number;
  /** Credits granted on purchase. */
  credits: number;
  /** Marketing highlight. */
  badge?: string;
  blurb: string;
}

export const FREE_SIGNUP_CREDITS = 3;

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    priceCents: 500,
    credits: 10,
    blurb: "Perfect for naming a single project.",
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 1500,
    credits: 40,
    badge: "Most popular",
    blurb: "Explore lots of directions and niches.",
  },
  {
    id: "studio",
    name: "Studio",
    priceCents: 4000,
    credits: 120,
    blurb: "For agencies and serial founders.",
  },
];

export function getPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function perCreditLabel(pack: CreditPack): string {
  return `$${(pack.priceCents / 100 / pack.credits).toFixed(2)} / credit`;
}
