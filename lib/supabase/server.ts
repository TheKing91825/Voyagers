/* ──────────────────────────────────────────────
 * Supabase Server Client — for API routes & server actions
 * Uses the service role key or anon key with request context
 * ────────────────────────────────────────────── */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side API routes.
 * Optionally pass a Firebase ID token to set the user context
 * so RLS policies apply correctly.
 */
export function createServerClient(firebaseToken?: string) {
    const headers: Record<string, string> = {};

    if (firebaseToken) {
        // Pass Firebase token as the authorization header
        // RLS policies check current_setting('request.jwt.claims')
        headers["Authorization"] = `Bearer ${firebaseToken}`;
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers },
    });
}
