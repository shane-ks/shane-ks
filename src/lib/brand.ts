/**
 * Single source of truth for the product's brand. Change it here and it
 * updates everywhere (nav, metadata, legal pages, OG image, app header).
 */
export const BRAND = {
  /** Full wordmark. */
  name: "NameRadar",
  /** Wordmark split for gradient styling: <prefix><accent>. */
  prefix: "Name",
  accent: "Radar",
  tagline: "Find the company name nobody's using.",
  description:
    "Describe your idea. NameRadar scans the live web, brainstorms brandable company names, and shows you which are wide open to claim — and which are already taken, with proof.",
} as const;
