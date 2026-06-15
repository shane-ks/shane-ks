import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getPack } from "@/lib/credits";
import { isSameOrigin } from "@/lib/request";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "bad_origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  // Resolve the pack server-side — never trust a price from the client.
  const pack = getPack(String(body?.pack || ""));
  if (!pack) {
    return NextResponse.json({ error: "invalid_pack" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pack.priceCents,
          product_data: {
            name: `NameVoid — ${pack.name} (${pack.credits} credits)`,
            description: `${pack.credits} name searches with live availability checks.`,
          },
        },
      },
    ],
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      pack_id: pack.id,
      credits: String(pack.credits),
    },
    success_url: `${siteUrl}/app?checkout=success`,
    cancel_url: `${siteUrl}/app?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
