/* ──────────────────────────────────────────────
 * /api/social/search
 * GET — search for users by username
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

export const GET = withAuth(async (req: NextRequest, user) => {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length < 1) {
            return NextResponse.json({ users: [] });
        }

        const supabase = createServerClient();

        // Get the current user so we can exclude them from results
        const { data: currentUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        // Search for users whose username matches the query
        const { data: users, error } = await supabase
            .from("users")
            .select("id, username, avatar_url")
            .ilike("username", `%${query.trim()}%`)
            .neq("id", currentUser?.id || "")
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ users: users || [] });
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
