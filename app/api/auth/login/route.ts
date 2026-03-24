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
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({ user: existingUser });
        }

        // If no user found by UID, check if email already exists
        if (user.email) {
            const { data: existingEmail, error: emailError } = await supabase
                .from("users")
                .select("*, user_preferences(*)")
                .eq("email", user.email)
                .maybeSingle();

            if (existingEmail && !emailError) {
                // User exists with this email, update their UID and return
                console.log("Linking existing email to new Firebase UID:", user.uid);
                const { data: linkedUser, error: linkError } = await supabase
                    .from("users")
                    .update({ firebase_uid: user.uid })
                    .eq("id", existingEmail.id)
                    .select("*, user_preferences(*)")
                    .single();
                
                if (linkError) {
                    return NextResponse.json({ error: "Failed to link accounts" }, { status: 500 });
                }
                return NextResponse.json({ user: linkedUser });
            }
        }

        // Auto-create for Google sign-in (first time)
        const body = await req.json().catch(() => ({}));
        let baseUsername =
            body.username ||
            user.email?.split("@")[0] ||
            `user_${Date.now()}`;
            
        baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        // Ensure username is unique
        let finalUsername = baseUsername;
        let isTaken = true;
        let attempts = 0;
        
        while (isTaken && attempts < 3) {
            const { data: usernameTaken } = await supabase
                .from("users")
                .select("id")
                .eq("username", finalUsername)
                .maybeSingle();
                
            if (usernameTaken) {
                finalUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
                attempts++;
            } else {
                isTaken = false;
            }
        }

        const { data: newUser, error } = await supabase
            .from("users")
            .insert({
                firebase_uid: user.uid,
                username: finalUsername,
                email: user.email || "",
                avatar_url: null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error auto-creating user:", error);
            return NextResponse.json({ error: error.message || "Failed to create user record" }, { status: 500 });
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
