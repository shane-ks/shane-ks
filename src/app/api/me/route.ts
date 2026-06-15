import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const FREE_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_SEARCH_LIMIT || 3);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_lifetime_pass, free_searches_used")
    .eq("id", user.id)
    .maybeSingle();

  const hasPass = profile?.has_lifetime_pass ?? false;
  const used = profile?.free_searches_used ?? 0;

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    hasPass,
    freeSearchesUsed: used,
    freeLimit: FREE_LIMIT,
    remaining: hasPass ? null : Math.max(0, FREE_LIMIT - used),
  });
}
