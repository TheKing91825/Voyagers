import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Singleton Supabase browser client.
 * Uses the anon (public) key — RLS policies control data access.
 */
export const supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey
);
