/* ──────────────────────────────────────────────
 * /api/profile
 * GET  — fetch current user profile + preferences
 * PUT  — update profile fields
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/profile — get the authenticated user's profile
export const GET = withAuth(async (_req: NextRequest, user) => {
    try {
        const supabase = createServerClient();

        const { data: profile, error } = await supabase
            .from("users")
            .select("*, user_preferences(*), visited_locations(*)")
            .eq("firebase_uid", user.uid)
            .single();

        if (error || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

// PUT /api/profile — update user profile and/or preferences
export const PUT = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const { username, avatar_url, preferences, visited_locations } = body;

        const supabase = createServerClient();

        // Get the Supabase user ID
        const { data: currentUser } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update user profile fields
        const profileUpdate: Record<string, unknown> = {};
        if (username) profileUpdate.username = username.toLowerCase();
        if (avatar_url !== undefined) profileUpdate.avatar_url = avatar_url;

        if (Object.keys(profileUpdate).length > 0) {
            const { error: profileError } = await supabase
                .from("users")
                .update(profileUpdate)
                .eq("id", currentUser.id);

            if (profileError) {
                console.error("Profile update error:", profileError);
                return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
            }
        }

        // Update preferences if provided
        if (preferences && typeof preferences === "object") {
            const { error: prefError } = await supabase
                .from("user_preferences")
                .update(preferences)
                .eq("user_id", currentUser.id);

            if (prefError) {
                console.error("Preferences update error:", prefError);
                return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
            }
        }

        // Add visited locations if provided
        if (visited_locations && Array.isArray(visited_locations)) {
            const locations = visited_locations.map(
                (loc: { city: string; country: string; latitude: number; longitude: number; visited_at?: string }) => ({
                    ...loc,
                    user_id: currentUser.id,
                })
            );

            const { error: locError } = await supabase
                .from("visited_locations")
                .insert(locations);

            if (locError) {
                console.error("Visited locations error:", locError);
                return NextResponse.json({ error: "Failed to add visited locations" }, { status: 500 });
            }
        }

        // Return updated profile
        const { data: updatedProfile } = await supabase
            .from("users")
            .select("*, user_preferences(*), visited_locations(*)")
            .eq("id", currentUser.id)
            .single();

        return NextResponse.json({ profile: updatedProfile });
    } catch (error) {
        console.error("Profile PUT error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
