export type NameStatus = "available" | "taken" | "uncertain";

export interface Evidence {
  title: string;
  url: string;
}

export interface NameResult {
  name: string;
  status: NameStatus;
  /** 0-100 confidence that the status is correct */
  confidence: number;
  reasoning?: string;
  evidence: Evidence[];
}

export interface SearchRecord {
  id: string;
  prompt: string;
  created_at: string;
  results?: NameResult[];
}

export interface Profile {
  id: string;
  email: string | null;
  credits: number;
}

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface LogoConcept {
  style: string;
  rationale?: string;
  /** Sanitized, self-contained SVG markup. */
  svg: string;
}

export interface BrandKit {
  name: string;
  palette: PaletteColor[];
  fonts: { heading: string; body: string };
  concepts: LogoConcept[];
}
