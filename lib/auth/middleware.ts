/* ──────────────────────────────────────────────
 * Auth Middleware — verify Firebase tokens on API routes
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";

/**
 * Extract the Firebase ID token from the Authorization header.
 * Returns null if no valid token is present.
 */
export function getTokenFromRequest(req: NextRequest): string | null {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

/**
 * Verify a Firebase ID token by calling Firebase's token info endpoint.
 * Returns the decoded token payload (with uid, email, etc.) or null if invalid.
 */
export async function verifyFirebaseToken(
    idToken: string
): Promise<{ uid: string; email?: string; name?: string } | null> {
    try {
        const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            }
        );

        if (!res.ok) return null;

        const data = await res.json();
        const user = data.users?.[0];
        if (!user) return null;

        return {
            uid: user.localId,
            email: user.email,
            name: user.displayName,
        };
    } catch {
        return null;
    }
}

/**
 * Higher-order function that wraps an API route handler with auth verification.
 * If auth fails, returns 401. Otherwise passes the decoded user to the handler.
 */
export function withAuth(
    handler: (
        req: NextRequest,
        user: { uid: string; email?: string; name?: string }
    ) => Promise<NextResponse>
) {
    return async (req: NextRequest) => {
        const token = getTokenFromRequest(req);
        if (!token) {
            return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
        }

        const user = await verifyFirebaseToken(token);
        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        return handler(req, user);
    };
}
