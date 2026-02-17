/* ──────────────────────────────────────────────
 * /api/social/reviews
 * GET  — fetch reviews (by city, user, or recent)
 * POST — create a new review
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/social/reviews?city=paris&country=france
export const GET = withAuth(async (req: NextRequest) => {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city");
        const country = searchParams.get("country");
        const userId = searchParams.get("user_id");

        let query = supabase
            .from("reviews")
            .select("*, users(username, avatar_url), comments(*, users(username, avatar_url))")
            .order("created_at", { ascending: false })
            .limit(20);

        if (city) query = query.ilike("city", `%${city}%`);
        if (country) query = query.ilike("country", `%${country}%`);
        if (userId) query = query.eq("user_id", userId);

        const { data: reviews, error } = await query;
        if (error) throw error;

        return NextResponse.json({ reviews: reviews || [] });
    } catch (error) {
        console.error("Reviews GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

// POST /api/social/reviews — create a new review
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const { city, country, title, body: reviewBody, rating, photo_urls } = body;

        if (!city || !country || !reviewBody || !rating) {
            return NextResponse.json(
                { error: "city, country, body, and rating are required" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
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

        const { data: review, error } = await supabase
            .from("reviews")
            .insert({
                user_id: supaUser.id,
                city,
                country,
                title: title || null,
                body: reviewBody,
                rating,
                photo_urls: photo_urls || [],
            })
            .select("*, users(username, avatar_url)")
            .single();

        if (error) throw error;

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error("Reviews POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
