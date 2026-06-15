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
    const credits = Number(session.metadata?.credits || 0);
    const packId = session.metadata?.pack_id || null;

    if (userId && credits > 0 && session.payment_status === "paid") {
      const admin = createSupabaseAdminClient();

      // Idempotency: the unique stripe_event_id rejects duplicate deliveries,
      // so credits are granted exactly once even if Stripe retries.
      const { error: insertErr } = await admin.from("purchases").insert({
        user_id: userId,
        stripe_event_id: event.id,
        stripe_session_id: session.id,
        pack_id: packId,
        credits,
        amount_cents: session.amount_total ?? 0,
      });

      if (insertErr) {
        // 23505 = unique_violation => already processed this event. Ack and move on.
        if ((insertErr as { code?: string }).code === "23505") {
          return NextResponse.json({ received: true, duplicate: true });
        }
        console.error("failed to record purchase", insertErr);
        return NextResponse.json({ error: "db error" }, { status: 500 });
      }

      const { error: grantErr } = await admin.rpc("grant_credits", {
        p_user_id: userId,
        p_amount: credits,
      });
      if (grantErr) {
        console.error("failed to grant credits", grantErr);
        return NextResponse.json({ error: "db error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
