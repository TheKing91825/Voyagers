/* ──────────────────────────────────────────────
 * /api/social/friends
 * POST   — send a friend request
 * PUT    — accept or reject a friend request
 * DELETE — remove a friend
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/social/friends — send a friend request
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const { receiver_username } = await req.json();

        if (!receiver_username) {
            return NextResponse.json({ error: "receiver_username is required" }, { status: 400 });
        }

        const supabase = createServerClient();

        const { data: sender } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        const { data: receiver } = await supabase
            .from("users")
            .select("id")
            .eq("username", receiver_username.toLowerCase())
            .single();

        if (!sender || !receiver) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (sender.id === receiver.id) {
            return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
        }

        // Check for existing request in either direction
        const { data: existing } = await supabase
            .from("friend_requests")
            .select("id, status")
            .or(
                `and(sender_id.eq.${sender.id},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${sender.id})`
            )
            .single();

        if (existing) {
            return NextResponse.json(
                { error: `Friend request already exists (status: ${existing.status})` },
                { status: 409 }
            );
        }

        const { data: request, error } = await supabase
            .from("friend_requests")
            .insert({
                sender_id: sender.id,
                receiver_id: receiver.id,
                status: "pending",
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ request }, { status: 201 });
    } catch (error) {
        console.error("Friend request POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

// PUT /api/social/friends — accept or reject a request
export const PUT = withAuth(async (req: NextRequest, user) => {
    try {
        const { request_id, action } = await req.json();

        if (!request_id || !["accepted", "rejected"].includes(action)) {
            return NextResponse.json(
                { error: "request_id and action (accepted/rejected) required" },
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

        const { data: updated, error } = await supabase
            .from("friend_requests")
            .update({ status: action })
            .eq("id", request_id)
            .eq("receiver_id", supaUser.id)
            .eq("status", "pending")
            .select()
            .single();

        if (error || !updated) {
            return NextResponse.json({ error: "Request not found or already handled" }, { status: 404 });
        }

        return NextResponse.json({ request: updated });
    } catch (error) {
        console.error("Friend request PUT error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

// DELETE /api/social/friends — remove a friend
export const DELETE = withAuth(async (req: NextRequest, user) => {
    try {
        const { friend_id } = await req.json();
        const supabase = createServerClient();

        const { data: supaUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!supaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete in both directions
        const { error } = await supabase
            .from("friend_requests")
            .delete()
            .or(
                `and(sender_id.eq.${supaUser.id},receiver_id.eq.${friend_id}),and(sender_id.eq.${friend_id},receiver_id.eq.${supaUser.id})`
            );

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Friend DELETE error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
