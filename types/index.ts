/* ──────────────────────────────────────────────
 * Voyager Travel App — Shared Type Definitions
 * ────────────────────────────────────────────── */

// ─── User ────────────────────────────────────

export interface UserProfile {
    id: string;
    firebase_uid: string;
    username: string;
    email: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface UserPreferences {
    id: string;
    user_id: string;
    budget: "budget" | "moderate" | "luxury";
    travel_style: "relaxed" | "balanced" | "adventurous";
    travel_pace: "slow" | "moderate" | "fast";
    group_size: "solo" | "couple" | "small_group" | "large_group";
    interests: string[];
    accommodation: "hostel" | "hotel" | "resort" | "airbnb" | "other";
    transportation: string[];
    dietary_preferences: string[];
    created_at: string;
    updated_at: string;
}

export interface VisitedLocation {
    id: string;
    user_id: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    visited_at?: string;
    created_at: string;
}

// ─── Trips ───────────────────────────────────

export interface Trip {
    id: string;
    owner_id: string;
    name: string;
    destination: string;
    start_date?: string;
    end_date?: string;
    thumbnail_url?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface TripDay {
    id: string;
    trip_id: string;
    day_number: number;
    date?: string;
    created_at: string;
}

export interface Activity {
    id: string;
    trip_day_id: string;
    name: string;
    description?: string;
    start_time?: string;
    duration_minutes?: number;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    notes_private: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface TripCollaborator {
    id: string;
    trip_id: string;
    user_id: string;
    role: "viewer" | "editor";
    created_at: string;
}

// ─── Social ──────────────────────────────────

export interface FriendRequest {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: "pending" | "accepted" | "rejected";
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    city: string;
    country: string;
    title?: string;
    body: string;
    rating: 1 | 2 | 3 | 4 | 5;
    photo_urls: string[];
    created_at: string;
    updated_at: string;
}

export interface Comment {
    id: string;
    review_id: string;
    user_id: string;
    body: string;
    created_at: string;
    updated_at: string;
}

// ─── AI / Explore ────────────────────────────

export interface GeneratedActivity {
    name: string;
    description: string;
    duration: string;
    estimated_cost: string;
    best_time: string;
    category: string;
}

export interface SwipeResult {
    activity: GeneratedActivity;
    liked: boolean;
}
