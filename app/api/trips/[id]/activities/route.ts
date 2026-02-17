/* ──────────────────────────────────────────────
 * /api/trips/[id]/activities
 * POST   — add an activity to a trip day
 * PUT    — update an existing activity
 * DELETE — remove an activity
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/trips/[id]/activities — add activity to a trip day
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const {
            trip_day_id,
            name,
            description,
            start_time,
            duration_minutes,
            location_name,
            latitude,
            longitude,
            notes,
            notes_private,
            order_index,
        } = body;

        if (!trip_day_id || !name) {
            return NextResponse.json(
                { error: "trip_day_id and name are required" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Verify user has edit access to this trip
        const { data: supaUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!supaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check that the trip day belongs to a trip the user owns or edits
        const { data: tripDay } = await supabase
            .from("trip_days")
            .select("trip_id")
            .eq("id", trip_day_id)
            .single();

        if (!tripDay) {
            return NextResponse.json({ error: "Trip day not found" }, { status: 404 });
        }

        const { data: trip } = await supabase
            .from("trips")
            .select("owner_id")
            .eq("id", tripDay.trip_id)
            .single();

        const isOwner = trip?.owner_id === supaUser.id;

        const { data: collab } = await supabase
            .from("trip_collaborators")
            .select("role")
            .eq("trip_id", tripDay.trip_id)
            .eq("user_id", supaUser.id)
            .single();

        const isEditor = collab?.role === "editor";

        if (!isOwner && !isEditor) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { data: activity, error } = await supabase
            .from("activities")
            .insert({
                trip_day_id,
                name,
                description: description || null,
                start_time: start_time || null,
                duration_minutes: duration_minutes || null,
                location_name: location_name || null,
                latitude: latitude || null,
                longitude: longitude || null,
                notes: notes || null,
                notes_private: notes_private ?? true,
                order_index: order_index ?? 0,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ activity }, { status: 201 });
    } catch (error) {
        console.error("Activity POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
