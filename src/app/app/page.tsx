import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import AppClient from "@/components/AppClient";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .maybeSingle();

  // Self-heal a missing profile row (e.g. if the signup trigger didn't fire).
  if (!profile) {
    const admin = createSupabaseAdminClient();
    await admin
      .from("profiles")
      .upsert({ id: user.id, email: user.email }, { onConflict: "id", ignoreDuplicates: true });
    const reread = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .maybeSingle();
    profile = reread.data;
  }

  return <AppClient email={user.email ?? ""} initialCredits={profile?.credits ?? 0} />;
}
