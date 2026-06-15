import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { brainstormNames, researchNames } from "@/lib/anthropic";

export const maxDuration = 120;

const FREE_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_SEARCH_LIMIT || 3);

export async function POST(request: Request) {
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

  // Load the caller's profile (RLS: own row only).
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_lifetime_pass, free_searches_used")
    .eq("id", user.id)
    .maybeSingle();

  const hasPass = profile?.has_lifetime_pass ?? false;
  const used = profile?.free_searches_used ?? 0;

  if (!hasPass && used >= FREE_LIMIT) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message:
          "You've used all your free searches. Grab the lifetime pass for unlimited access.",
      },
      { status: 402 },
    );
  }

  let names: string[];
  let results;
  try {
    names = await brainstormNames(prompt, count);
    results = await researchNames(names);
  } catch (err) {
    console.error("generation failed", err);
    return NextResponse.json(
      { error: "generation_failed", message: "The naming engine hit an error. Please try again." },
      { status: 502 },
    );
  }

  // Persist with the service role (users have no insert policy by design).
  const admin = createSupabaseAdminClient();
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

  let newUsed = used;
  if (!hasPass) {
    const { data } = await admin.rpc("increment_free_search", {
      p_user_id: user.id,
    });
    if (typeof data === "number") newUsed = data;
  }

  return NextResponse.json({
    searchId: search?.id ?? null,
    prompt,
    results,
    usage: {
      hasPass,
      freeSearchesUsed: newUsed,
      freeLimit: FREE_LIMIT,
      remaining: hasPass ? null : Math.max(0, FREE_LIMIT - newUsed),
    },
  });
}
