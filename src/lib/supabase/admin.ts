import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — only ever import this from
 * trusted server code (route handlers, webhooks). Never expose to the client.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
