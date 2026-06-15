import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Stripe needs the raw request body to verify the signature.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook secret not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("invalid stripe signature", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.metadata?.user_id || session.client_reference_id || null;

    if (userId && session.payment_status === "paid") {
      const admin = createSupabaseAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({
          has_lifetime_pass: true,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
        })
        .eq("id", userId);

      if (error) {
        console.error("failed to grant lifetime pass", error);
        return NextResponse.json({ error: "db update failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
