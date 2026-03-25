/* ──────────────────────────────────────────────
 * /api/profile/visited
 * POST — save a location to user's visited/bucket list
 * GET  — get user's visited locations
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/profile/visited — fetch visited locations
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

        const { data: locations, error } = await supabase
            .from("visited_locations")
            .select("*")
            .eq("user_id", supaUser.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ locations: locations || [] });
    } catch (error) {
        console.error("Visited GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

// POST /api/profile/visited — add a visited location
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const { city, country, latitude, longitude } = await req.json();

        if (!city || !country) {
            return NextResponse.json({ error: "city and country are required" }, { status: 400 });
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

        // Check if already saved
        const { data: existing } = await supabase
            .from("visited_locations")
            .select("id")
            .eq("user_id", supaUser.id)
            .eq("city", city)
            .eq("country", country)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ message: "Already saved" }, { status: 200 });
        }

        const { data: location, error } = await supabase
            .from("visited_locations")
            .insert({
                user_id: supaUser.id,
                city,
                country,
                latitude: latitude || 0,
                longitude: longitude || 0,
                visited_at: new Date().toISOString().split("T")[0],
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ location }, { status: 201 });
    } catch (error) {
        console.error("Visited POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
