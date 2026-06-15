import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateBrandKit } from "@/lib/logo";
import { LOGO_CREDIT_COST } from "@/lib/credits";
import { isSameOrigin } from "@/lib/request";

export const maxDuration = 120;

const MAX_NAME_LEN = 80;
const MAX_STYLE_LEN = 300;
const MIN_INTERVAL_MS = 4000;

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
  const name = String(body?.name || "").trim();
  const style = String(body?.style || "").trim().slice(0, MAX_STYLE_LEN);

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (name.length > MAX_NAME_LEN) {
    return NextResponse.json(
      { error: "name_too_long", message: `Keep the name under ${MAX_NAME_LEN} characters.` },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();

  await admin
    .from("profiles")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id", ignoreDuplicates: true });

  // Lightweight rate limit (shared with name generation).
  const { data: prof } = await admin
    .from("profiles")
    .select("last_generate_at")
    .eq("id", user.id)
    .maybeSingle();
  if (prof?.last_generate_at) {
    const elapsed = Date.now() - new Date(prof.last_generate_at).getTime();
    if (elapsed < MIN_INTERVAL_MS) {
      return NextResponse.json(
        { error: "rate_limited", message: "Slow down a moment and try again." },
        { status: 429 },
      );
    }
  }

  // Atomically reserve the logo cost before doing expensive work.
  const { data: remaining, error: reserveErr } = await admin.rpc("reserve_credits", {
    p_user_id: user.id,
    p_amount: LOGO_CREDIT_COST,
  });

  if (reserveErr) {
    console.error("reserve_credits failed", reserveErr);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (typeof remaining !== "number" || remaining < 0) {
    return NextResponse.json(
      {
        error: "no_credits",
        message: `Designing a brand kit costs ${LOGO_CREDIT_COST} credits. Top up to continue.`,
      },
      { status: 402 },
    );
  }

  let brandKit;
  try {
    brandKit = await generateBrandKit(name, style);
  } catch (err) {
    console.error("logo generation failed", err);
    await admin.rpc("refund_credits", { p_user_id: user.id, p_amount: LOGO_CREDIT_COST });
    return NextResponse.json(
      {
        error: "generation_failed",
        message: "The design engine hit an error. Your credits were refunded — please try again.",
      },
      { status: 502 },
    );
  }

  await admin.from("brand_kits").insert({
    user_id: user.id,
    name: brandKit.name,
    prompt: style || null,
    palette: brandKit.palette,
    fonts: brandKit.fonts,
    concepts: brandKit.concepts,
  });

  return NextResponse.json({ brandKit, credits: remaining });
}
