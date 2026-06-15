import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppClient from "@/components/AppClient";

const FREE_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_SEARCH_LIMIT || 3);

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_lifetime_pass, free_searches_used")
    .eq("id", user.id)
    .maybeSingle();

  const hasPass = profile?.has_lifetime_pass ?? false;
  const used = profile?.free_searches_used ?? 0;

  return (
    <AppClient
      email={user.email ?? ""}
      initialHasPass={hasPass}
      initialUsed={used}
      freeLimit={FREE_LIMIT}
    />
  );
}
