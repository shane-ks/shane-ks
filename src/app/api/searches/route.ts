import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: searches } = await supabase
    .from("searches")
    .select("id, prompt, created_at, name_results(name, status, confidence, reasoning, evidence)")
    .order("created_at", { ascending: false })
    .limit(25);

  const history = (searches ?? []).map((s) => ({
    id: s.id,
    prompt: s.prompt,
    created_at: s.created_at,
    results: ((s as { name_results?: unknown[] }).name_results ?? []) as unknown[],
  }));

  return NextResponse.json({ history });
}
