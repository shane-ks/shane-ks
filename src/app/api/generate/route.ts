import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { brainstormNames, researchNames } from "@/lib/anthropic";
import { isSameOrigin } from "@/lib/request";

export const maxDuration = 120;

const MAX_PROMPT_LEN = 600;
// Minimum seconds between generations for one user (cheap abuse throttle on top
// of credit gating).
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
  const prompt = String(body?.prompt || "").trim();
  const count = Math.min(Math.max(Number(body?.count) || 8, 3), 12);

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LEN) {
    return NextResponse.json(
      { error: "prompt_too_long", message: `Keep your prompt under ${MAX_PROMPT_LEN} characters.` },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();

  // Make sure a profile row exists (covers the rare case where the signup
  // trigger didn't run) so credit accounting always has a home.
  await admin
    .from("profiles")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id", ignoreDuplicates: true });

  // Lightweight rate limit.
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

  // Atomically reserve one credit BEFORE doing expensive work. Returns the new
  // balance, or -1 if the user has none.
  const { data: remaining, error: reserveErr } = await admin.rpc("reserve_credit", {
    p_user_id: user.id,
  });

  if (reserveErr) {
    console.error("reserve_credit failed", reserveErr);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (typeof remaining !== "number" || remaining < 0) {
    return NextResponse.json(
      {
        error: "no_credits",
        message: "You're out of credits. Top up to keep searching.",
      },
      { status: 402 },
    );
  }

  let results;
  try {
    const names = await brainstormNames(prompt, count);
    if (names.length === 0) throw new Error("no names generated");
    results = await researchNames(names);
  } catch (err) {
    console.error("generation failed", err);
    // Refund the reserved credit — the user got nothing.
    await admin.rpc("refund_credit", { p_user_id: user.id });
    return NextResponse.json(
      {
        error: "generation_failed",
        message: "The naming engine hit an error. Your credit was refunded — please try again.",
      },
      { status: 502 },
    );
  }

  // Persist the search and its results.
  const { data: search } = await admin
    .from("searches")
    .insert({ user_id: user.id, prompt })
    .select("id, created_at")
    .single();

  if (search) {
    await admin.from("name_results").insert(
      results.map((r) => ({
        search_id: search.id,
        user_id: user.id,
        name: r.name,
        status: r.status,
        confidence: r.confidence,
        reasoning: r.reasoning ?? null,
        evidence: r.evidence,
      })),
    );
  }

  return NextResponse.json({
    searchId: search?.id ?? null,
    prompt,
    results,
    credits: remaining,
  });
}
