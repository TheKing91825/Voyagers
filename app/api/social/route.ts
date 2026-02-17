/* ──────────────────────────────────────────────
 * /api/social
 * GET  — get friends list, pending requests, and recent reviews
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

export const GET = withAuth(async (_req: NextRequest, user) => {
    try {
        const supabase = createServerClient();

        const { data: supaUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!supaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Accepted friends (as sender or receiver)
        const { data: friendsSent } = await supabase
            .from("friend_requests")
            .select("receiver_id, users!friend_requests_receiver_id_fkey(id, username, avatar_url)")
            .eq("sender_id", supaUser.id)
            .eq("status", "accepted");

        const { data: friendsReceived } = await supabase
            .from("friend_requests")
            .select("sender_id, users!friend_requests_sender_id_fkey(id, username, avatar_url)")
            .eq("receiver_id", supaUser.id)
            .eq("status", "accepted");

        const friends = [
            ...(friendsSent?.map((f) => f.users) || []),
            ...(friendsReceived?.map((f) => f.users) || []),
        ];

        // Pending requests received
        const { data: pendingRequests } = await supabase
            .from("friend_requests")
            .select("*, users!friend_requests_sender_id_fkey(username, avatar_url)")
            .eq("receiver_id", supaUser.id)
            .eq("status", "pending");

        // Recent reviews from friends
        const friendIds = friends.map((f) => {
            if (f && typeof f === "object" && "id" in f) {
                return (f as { id: string }).id;
            }
            return null;
        }).filter(Boolean);

        let friendReviews: unknown[] = [];
        if (friendIds.length > 0) {
            const { data } = await supabase
                .from("reviews")
                .select("*, users(username, avatar_url), comments(*, users(username, avatar_url))")
                .in("user_id", friendIds)
                .order("created_at", { ascending: false })
                .limit(20);

            friendReviews = data || [];
        }

        return NextResponse.json({
            friends,
            pending_requests: pendingRequests || [],
            friend_reviews: friendReviews,
        });
    } catch (error) {
        console.error("Social GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
