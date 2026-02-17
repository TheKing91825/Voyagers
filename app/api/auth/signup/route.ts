/* ──────────────────────────────────────────────
 * POST /api/auth/signup
 * Creates a Firebase user and syncs to Supabase
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const { username } = body;

        if (!username || typeof username !== "string" || username.length < 3) {
            return NextResponse.json(
                { error: "Username must be at least 3 characters" },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Check if user already exists
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("firebase_uid", user.uid)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "User already exists", user: existing },
                { status: 409 }
            );
        }

        // Check username availability
        const { data: usernameTaken } = await supabase
            .from("users")
            .select("id")
            .eq("username", username.toLowerCase())
            .single();

        if (usernameTaken) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 409 }
            );
        }

        // Create user in Supabase
        const { data: newUser, error } = await supabase
            .from("users")
            .insert({
                firebase_uid: user.uid,
                username: username.toLowerCase(),
                email: user.email || "",
                avatar_url: null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating user:", error);
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // Create default preferences
        await supabase.from("user_preferences").insert({
            user_id: newUser.id,
        });

        return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
