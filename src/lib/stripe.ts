import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  cached = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  return cached;
}

export const LIFETIME_PRICE_CENTS = 1000; // $10.00
