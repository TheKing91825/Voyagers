"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

// Fallback mock data (shown when not logged in or no trips exist)
const MOCK_TRIPS = [
    {
        id: "1",
        title: "Summer in Tuscany",
        destination: "Tuscany, Italy",
        imageUrl: "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1974&auto=format&fit=crop",
        startDate: "2026-06-15",
        endDate: "2026-06-25",
        status: "upcoming" as const,
        collaborators: [
            { id: "101", username: "emma", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop" },
            { id: "102", username: "alex", avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop" }
        ]
    },
    {
        id: "2",
        title: "Kyoto Cherry Blossoms",
        destination: "Kyoto, Japan",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        startDate: "2025-04-01",
        endDate: "2025-04-10",
        status: "past" as const,
        collaborators: []
    },
    {
        id: "3",
        title: "Iceland Roadtrip",
        destination: "Reykjavik, Iceland",
        imageUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2759&auto=format&fit=crop",
        startDate: "2026-09-10",
        endDate: "2026-09-20",
        status: "draft" as const,
        collaborators: [
            { id: "103", username: "sarah", avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" }
        ]
    }
];

export default function MyTripsPage() {
    const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "draft">("all");
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setTrips(MOCK_TRIPS);
                setLoading(false);
                setIsLoggedIn(false);
                return;
            }

            setIsLoggedIn(true);

            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/trips", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.trips && data.trips.length > 0) {
                        // Map DB trips to the format TripCard expects
                        const mapped = data.trips.map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            destination: t.destination,
                            imageUrl: t.cover_image_url || getDefaultImage(t.destination),
                            startDate: t.start_date,
                            endDate: t.end_date,
                            status: t.status || "draft",
                            collaborators: (t.trip_collaborators || []).map((c: any) => ({
                                id: c.user_id,
                                username: c.users?.username || "friend",
                                avatar_url: c.users?.avatar_url,
                            })),
                        }));
                        setTrips(mapped);
                    } else {
                        // No trips yet — show empty state
                        setTrips([]);
                    }
                } else {
                    setTrips(MOCK_TRIPS);
                }
            } catch {
                setTrips(MOCK_TRIPS);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredTrips = trips.filter(trip => {
        if (filter === "all") return true;
        return trip.status === filter;
    });

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto pt-24 pb-8 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">My Adventures</h1>
                    <p className="text-muted-foreground">Manage your upcoming and past journeys.</p>
                </div>
                <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-5 h-5 mr-2" /> Plan New Trip
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {(["all", "upcoming", "past", "draft"] as const).map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        onClick={() => setFilter(f)}
                        className="rounded-full px-6 capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>

            {filteredTrips.length === 0 && (
                <div className="text-center py-20 bg-muted rounded-2xl border border-dashed border-border/60">
                    <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                        {isLoggedIn
                            ? "No trips found. Start planning your next adventure!"
                            : "Sign in to see your trips."}
                    </p>
                    {isLoggedIn && (
                        <Button variant="outline" className="border-primary/20 text-primary">
                            <Plus className="w-4 h-4 mr-2" /> Plan your first trip
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

function getDefaultImage(destination: string): string {
    const lower = (destination || "").toLowerCase();
    if (lower.includes("italy") || lower.includes("tuscan")) return "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1974&auto=format&fit=crop";
    if (lower.includes("japan") || lower.includes("kyoto")) return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop";
    if (lower.includes("iceland")) return "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2759&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070&auto=format&fit=crop";
}
