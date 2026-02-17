/* ──────────────────────────────────────────────
 * /api/trips/[id]
 * GET    — fetch a single trip with days + activities
 * PUT    — update trip details
 * DELETE — delete a trip
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/trips/[id]
export const GET = withAuth(
    async (req: NextRequest, user) => {
        try {
            const id = req.nextUrl.pathname.split("/").pop();
            const supabase = createServerClient();

            const { data: supaUser } = await supabase
                .from("users")
                .select("id")
                .eq("firebase_uid", user.uid)
                .single();

            const { data: trip, error } = await supabase
                .from("trips")
                .select(
                    "*, trip_days(*, activities(*)), trip_collaborators(*, users(username, avatar_url)), users!trips_owner_id_fkey(username, avatar_url)"
                )
                .eq("id", id!)
                .single();

            if (error || !trip) {
                return NextResponse.json({ error: "Trip not found" }, { status: 404 });
            }

            // Check access: owner, collaborator, or public
            const isOwner = trip.owner_id === supaUser?.id;
            const isCollaborator = trip.trip_collaborators?.some(
                (c: { user_id: string }) => c.user_id === supaUser?.id
            );

            if (!trip.is_public && !isOwner && !isCollaborator) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }

            // Sort days and activities
            if (trip.trip_days) {
                trip.trip_days.sort(
                    (a: { day_number: number }, b: { day_number: number }) =>
                        a.day_number - b.day_number
                );
                for (const day of trip.trip_days) {
                    if (day.activities) {
                        day.activities.sort(
                            (a: { order_index: number }, b: { order_index: number }) =>
                                a.order_index - b.order_index
                        );
                    }
                }
            }

            return NextResponse.json({ trip, role: isOwner ? "owner" : isCollaborator ? "collaborator" : "viewer" });
        } catch (error) {
            console.error("Trip GET error:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    }
);

// PUT /api/trips/[id]
export const PUT = withAuth(
    async (req: NextRequest, user) => {
        try {
            const id = req.nextUrl.pathname.split("/").pop();
            const body = await req.json();
            const supabase = createServerClient();

            const { data: supaUser } = await supabase
                .from("users")
                .select("id")
                .eq("firebase_uid", user.uid)
                .single();

            if (!supaUser) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Verify ownership
            const { data: trip } = await supabase
                .from("trips")
                .select("owner_id")
                .eq("id", id!)
                .single();

            if (!trip || trip.owner_id !== supaUser.id) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }

            const { name, destination, start_date, end_date, is_public, thumbnail_url } = body;
            const updates: Record<string, unknown> = {};
            if (name !== undefined) updates.name = name;
            if (destination !== undefined) updates.destination = destination;
            if (start_date !== undefined) updates.start_date = start_date;
            if (end_date !== undefined) updates.end_date = end_date;
            if (is_public !== undefined) updates.is_public = is_public;
            if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;

            const { data: updatedTrip, error } = await supabase
                .from("trips")
                .update(updates)
                .eq("id", id!)
                .select("*, trip_days(*, activities(*))")
                .single();

            if (error) throw error;

            return NextResponse.json({ trip: updatedTrip });
        } catch (error) {
            console.error("Trip PUT error:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    }
);

// DELETE /api/trips/[id]
export const DELETE = withAuth(
    async (req: NextRequest, user) => {
        try {
            const id = req.nextUrl.pathname.split("/").pop();
            const supabase = createServerClient();

            const { data: supaUser } = await supabase
                .from("users")
                .select("id")
                .eq("firebase_uid", user.uid)
                .single();

            if (!supaUser) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const { error } = await supabase
                .from("trips")
                .delete()
                .eq("id", id!)
                .eq("owner_id", supaUser.id);

            if (error) throw error;

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Trip DELETE error:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
    }
);
