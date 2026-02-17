/* ──────────────────────────────────────────────
 * POST /api/auth/login
 * Looks up the Supabase user by Firebase UID.
 * If none exists (e.g. Google sign-in first time), auto-creates one.
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const supabase = createServerClient();

        // Look up user by Firebase UID
        const { data: existingUser } = await supabase
            .from("users")
            .select("*, user_preferences(*)")
            .eq("firebase_uid", user.uid)
            .single();

        if (existingUser) {
            return NextResponse.json({ user: existingUser });
        }

        // Auto-create for Google sign-in (first time)
        const body = await req.json().catch(() => ({}));
        const username =
            body.username ||
            user.email?.split("@")[0] ||
            `user_${Date.now()}`;

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
            console.error("Error auto-creating user:", error);
            return NextResponse.json({ error: "Failed to create user record" }, { status: 500 });
        }

        // Create default preferences
        await supabase.from("user_preferences").insert({
            user_id: newUser.id,
        });

        // Re-fetch with preferences
        const { data: fullUser } = await supabase
            .from("users")
            .select("*, user_preferences(*)")
            .eq("id", newUser.id)
            .single();

        return NextResponse.json({ user: fullUser, created: true }, { status: 201 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
