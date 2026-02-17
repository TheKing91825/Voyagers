/* ──────────────────────────────────────────────
 * /api/trips
 * GET  — list user's trips (owned + collaborating)
 * POST — create a new trip with auto-generated days
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/trips — list all trips for the authenticated user
export const GET = withAuth(async (req: NextRequest, user) => {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(req.url);
        const publicOnly = searchParams.get("public") === "true";

        // Get the Supabase user ID
        const { data: supaUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!supaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (publicOnly) {
            // Fetch public trips for the explore feed
            const { data: trips, error } = await supabase
                .from("trips")
                .select("*, users!trips_owner_id_fkey(username, avatar_url)")
                .eq("is_public", true)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return NextResponse.json({ trips });
        }

        // Fetch owned trips
        const { data: ownedTrips, error: ownedError } = await supabase
            .from("trips")
            .select("*, trip_days(*, activities(*))")
            .eq("owner_id", supaUser.id)
            .order("created_at", { ascending: false });

        if (ownedError) throw ownedError;

        // Fetch trips where user is a collaborator
        const { data: collabs } = await supabase
            .from("trip_collaborators")
            .select("trip_id, role")
            .eq("user_id", supaUser.id);

        let collabTrips: typeof ownedTrips = [];
        if (collabs && collabs.length > 0) {
            const tripIds = collabs.map((c) => c.trip_id);
            const { data } = await supabase
                .from("trips")
                .select("*, trip_days(*, activities(*))")
                .in("id", tripIds)
                .order("created_at", { ascending: false });

            collabTrips = data || [];
        }

        return NextResponse.json({
            owned: ownedTrips || [],
            collaborating: collabTrips,
        });
    } catch (error) {
        console.error("Trips GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

// POST /api/trips — create a new trip
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const { name, destination, start_date, end_date, is_public } = body;

        if (!name || !destination) {
            return NextResponse.json(
                { error: "Name and destination are required" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Get user ID
        const { data: supaUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!supaUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create the trip
        const { data: trip, error: tripError } = await supabase
            .from("trips")
            .insert({
                owner_id: supaUser.id,
                name,
                destination,
                start_date: start_date || null,
                end_date: end_date || null,
                is_public: is_public || false,
            })
            .select()
            .single();

        if (tripError) throw tripError;

        // Auto-create trip days if dates are provided
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const days = Array.from({ length: Math.min(dayCount, 30) }, (_, i) => {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                return {
                    trip_id: trip.id,
                    day_number: i + 1,
                    date: date.toISOString().split("T")[0],
                };
            });

            await supabase.from("trip_days").insert(days);
        }

        // Re-fetch with days
        const { data: fullTrip } = await supabase
            .from("trips")
            .select("*, trip_days(*)")
            .eq("id", trip.id)
            .single();

        return NextResponse.json({ trip: fullTrip }, { status: 201 });
    } catch (error) {
        console.error("Trips POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
