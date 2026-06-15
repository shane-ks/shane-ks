import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, LIFETIME_PRICE_CENTS } from "@/lib/stripe";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Already paid? Nothing to do.
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_lifetime_pass")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.has_lifetime_pass) {
    return NextResponse.json({ error: "already_purchased" }, { status: 400 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const priceId = process.env.STRIPE_LIFETIME_PRICE_ID;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: LIFETIME_PRICE_CENTS,
              product_data: {
                name: "NameVoid Lifetime Pass",
                description: "Unlimited company-name searches, forever.",
              },
            },
          },
    ],
    // Bind the purchase to the user so the webhook can grant the pass.
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    success_url: `${siteUrl}/app?checkout=success`,
    cancel_url: `${siteUrl}/app?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
