/* ──────────────────────────────────────────────
 * /api/social/comments
 * POST — add a comment to a review
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/social/comments
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const { review_id, body: commentBody } = await req.json();

        if (!review_id || !commentBody) {
            return NextResponse.json(
                { error: "review_id and body are required" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        const { data: supaUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!supaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify review exists
        const { data: review } = await supabase
            .from("reviews")
            .select("id")
            .eq("id", review_id)
            .single();

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const { data: comment, error } = await supabase
            .from("comments")
            .insert({
                review_id,
                user_id: supaUser.id,
                body: commentBody,
            })
            .select("*, users(username, avatar_url)")
            .single();

        if (error) throw error;

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error("Comment POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
