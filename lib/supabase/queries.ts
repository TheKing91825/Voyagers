/* ──────────────────────────────────────────────
 * Supabase reusable query helpers
 * Wraps common database operations for use in components & server actions
 * ────────────────────────────────────────────── */

import { supabase } from "./client";
import type {
    UserProfile,
    UserPreferences,
    Trip,
    Review,
    VisitedLocation,
    FriendRequest,
} from "@/types";

// ─── User Queries ────────────────────────────

export async function getUserByFirebaseUid(firebaseUid: string) {
    const { data, error } = await supabase
        .from("users")
        .select("*, user_preferences(*), visited_locations(*)")
        .eq("firebase_uid", firebaseUid)
        .single();

    if (error) throw error;
    return data as UserProfile & {
        user_preferences: UserPreferences[];
        visited_locations: VisitedLocation[];
    };
}

export async function getUserByUsername(username: string) {
    const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url, created_at")
        .eq("username", username.toLowerCase())
        .single();

    if (error) throw error;
    return data;
}

// ─── Trip Queries ────────────────────────────

export async function getPublicTrips(limit = 20) {
    const { data, error } = await supabase
        .from("trips")
        .select("*, users!trips_owner_id_fkey(username, avatar_url)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as (Trip & { users: Pick<UserProfile, "username" | "avatar_url"> })[];
}

export async function getTripById(tripId: string) {
    const { data, error } = await supabase
        .from("trips")
        .select(
            "*, trip_days(*, activities(*)), trip_collaborators(*, users(username, avatar_url)), users!trips_owner_id_fkey(username, avatar_url)"
        )
        .eq("id", tripId)
        .single();

    if (error) throw error;
    return data;
}

// ─── Review Queries ──────────────────────────

export async function getReviewsByCity(city: string, limit = 20) {
    const { data, error } = await supabase
        .from("reviews")
        .select("*, users(username, avatar_url), comments(*, users(username, avatar_url))")
        .ilike("city", `%${city}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as (Review & { users: Pick<UserProfile, "username" | "avatar_url"> })[];
}

// ─── Friend Queries ──────────────────────────

export async function getFriendsList(userId: string) {
    const { data: sent } = await supabase
        .from("friend_requests")
        .select("receiver_id, users!friend_requests_receiver_id_fkey(id, username, avatar_url)")
        .eq("sender_id", userId)
        .eq("status", "accepted");

    const { data: received } = await supabase
        .from("friend_requests")
        .select("sender_id, users!friend_requests_sender_id_fkey(id, username, avatar_url)")
        .eq("receiver_id", userId)
        .eq("status", "accepted");

    return [
        ...(sent?.map((f) => f.users) || []),
        ...(received?.map((f) => f.users) || []),
    ];
}

export async function getPendingRequests(userId: string) {
    const { data, error } = await supabase
        .from("friend_requests")
        .select("*, users!friend_requests_sender_id_fkey(username, avatar_url)")
        .eq("receiver_id", userId)
        .eq("status", "pending");

    if (error) throw error;
    return data as (FriendRequest & { users: Pick<UserProfile, "username" | "avatar_url"> })[];
}
