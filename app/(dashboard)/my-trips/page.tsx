"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, MapPin, Calendar, Globe, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

// Fallback mock data (shown when not logged in)
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
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "draft">("all");
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Create Trip dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [tripName, setTripName] = useState("");
    const [tripDestination, setTripDestination] = useState("");
    const [tripStartDate, setTripStartDate] = useState("");
    const [tripEndDate, setTripEndDate] = useState("");
    const [tripPublic, setTripPublic] = useState(false);

    // Generated AI activities for preview
    const [aiActivities, setAiActivities] = useState<any[]>([]);

    const fetchTrips = useCallback(async (t: string) => {
        try {
            const res = await fetch("/api/trips", {
                headers: { Authorization: `Bearer ${t}` },
            });

            if (res.ok) {
                const data = await res.json();
                const allTrips = [...(data.owned || []), ...(data.collaborating || [])];

                if (allTrips.length > 0) {
                    const now = new Date();
                    const mapped = allTrips.map((t: any) => {
                        // Determine status from dates
                        let status = "draft";
                        if (t.start_date && t.end_date) {
                            const end = new Date(t.end_date);
                            const start = new Date(t.start_date);
                            if (end < now) status = "past";
                            else if (start > now) status = "upcoming";
                            else status = "upcoming"; // currently ongoing
                        }

                        return {
                            id: t.id,
                            title: t.name,
                            destination: t.destination,
                            imageUrl: t.thumbnail_url || getDefaultImage(t.destination),
                            startDate: t.start_date,
                            endDate: t.end_date,
                            status,
                            collaborators: [],
                        };
                    });
                    setTrips(mapped);
                } else {
                    setTrips([]);
                }
            } else {
                setTrips(MOCK_TRIPS);
            }
        } catch {
            setTrips(MOCK_TRIPS);
        }
    }, []);

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
                const t = await user.getIdToken();
                setToken(t);
                await fetchTrips(t);
            } catch {
                setTrips(MOCK_TRIPS);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchTrips]);

    const handleGenerateAI = async () => {
        if (!tripDestination.trim()) {
            toast.error("Enter a destination first.");
            return;
        }
        if (!token) {
            toast.error("Please log in to use AI suggestions.");
            return;
        }

        setGeneratingAI(true);
        try {
            const res = await fetch("/api/explore", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ destination: tripDestination, count: 5 }),
            });

            if (res.ok) {
                const data = await res.json();
                setAiActivities(data.activities || []);
                toast.success("AI generated your itinerary! ✨");
            } else {
                toast.error("AI generation failed. You can add activities manually.");
            }
        } catch {
            toast.error("Network error. Try again.");
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleCreateTrip = async () => {
        if (!tripName.trim() || !tripDestination.trim()) {
            toast.error("Trip name and destination are required.");
            return;
        }
        if (!token) {
            toast.error("Please log in to create a trip.");
            return;
        }

        setCreating(true);
        try {
            const res = await fetch("/api/trips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: tripName.trim(),
                    destination: tripDestination.trim(),
                    start_date: tripStartDate || null,
                    end_date: tripEndDate || null,
                    is_public: tripPublic,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const tripId = data.trip?.id;
                toast.success("Trip created! 🎉");

                // If AI activities were generated, add them to the first day
                if (aiActivities.length > 0 && tripId) {
                    const tripDays = data.trip?.trip_days || [];
                    if (tripDays.length > 0) {
                        try {
                            for (const activity of aiActivities.slice(0, 5)) {
                                await fetch(`/api/trips/${tripId}/activities`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        trip_day_id: tripDays[0].id,
                                        name: activity.name,
                                        description: activity.description,
                                        duration_minutes: parseDuration(activity.duration),
                                        location_name: activity.name,
                                    }),
                                });
                            }
                        } catch {
                            // Non-blocking: activities can be added later
                        }
                    }
                }

                // Reset form
                setTripName("");
                setTripDestination("");
                setTripStartDate("");
                setTripEndDate("");
                setTripPublic(false);
                setAiActivities([]);
                setCreateOpen(false);

                // Refresh trip list
                await fetchTrips(token);
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to create trip.");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setCreating(false);
        }
    };

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

                {/* ── Create Trip Dialog ── */}
                <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setAiActivities([]); }}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                            <Plus className="w-5 h-5 mr-2" /> Plan New Trip
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-display">Plan a New Adventure</DialogTitle>
                            <DialogDescription>
                                Set your destination and dates. Use AI to auto-generate your itinerary!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-4">
                            {/* Trip Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="trip-name">Trip Name *</Label>
                                <Input
                                    id="trip-name"
                                    placeholder="e.g. Summer in Tuscany"
                                    value={tripName}
                                    onChange={(e) => setTripName(e.target.value)}
                                />
                            </div>

                            {/* Destination */}
                            <div className="grid gap-2">
                                <Label htmlFor="trip-dest">Destination *</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="trip-dest"
                                        placeholder="e.g. Tuscany, Italy"
                                        className="pl-10"
                                        value={tripDestination}
                                        onChange={(e) => setTripDestination(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="start-date"
                                            type="date"
                                            className="pl-10"
                                            value={tripStartDate}
                                            onChange={(e) => setTripStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="end-date"
                                            type="date"
                                            className="pl-10"
                                            value={tripEndDate}
                                            onChange={(e) => setTripEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Public toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="trip-public"
                                    checked={tripPublic}
                                    onChange={(e) => setTripPublic(e.target.checked)}
                                    className="h-4 w-4 rounded border-border"
                                />
                                <Label htmlFor="trip-public" className="text-sm font-normal text-muted-foreground">
                                    Make this trip visible to friends
                                </Label>
                            </div>

                            {/* AI Generation */}
                            <div className="border border-dashed border-border rounded-xl p-4 bg-muted/30">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-secondary" />
                                        <span className="text-sm font-semibold text-foreground">AI Itinerary</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGenerateAI}
                                        disabled={generatingAI || !tripDestination.trim()}
                                        className="text-xs"
                                    >
                                        {generatingAI ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3 mr-1" />
                                        )}
                                        {generatingAI ? "Generating..." : "Generate with AI"}
                                    </Button>
                                </div>

                                {aiActivities.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {aiActivities.map((a: any, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-background border border-border/50">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                                                    <p className="text-xs text-muted-foreground">{a.duration} · {a.estimated_cost} · {a.best_time}</p>
                                                </div>
                                                <button
                                                    onClick={() => setAiActivities((prev) => prev.filter((_, idx) => idx !== i))}
                                                    className="text-muted-foreground/50 hover:text-red-500 shrink-0 mt-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Enter a destination above and hit "Generate" to let AI suggest activities for your trip.
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTrip} disabled={creating}>
                                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Create Trip
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                        <Button
                            variant="outline"
                            className="border-primary/20 text-primary"
                            onClick={() => setCreateOpen(true)}
                        >
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
    if (lower.includes("france") || lower.includes("paris")) return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop";
    if (lower.includes("greece") || lower.includes("santorini")) return "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop";
    if (lower.includes("bali") || lower.includes("indonesia")) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop";
    if (lower.includes("morocco")) return "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=2070&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070&auto=format&fit=crop";
}

function parseDuration(durationStr: string): number {
    if (!durationStr) return 60;
    const lower = durationStr.toLowerCase();
    if (lower.includes("half day")) return 240;
    if (lower.includes("full day")) return 480;
    const match = lower.match(/(\d+\.?\d*)\s*hour/);
    if (match) return Math.round(parseFloat(match[1]) * 60);
    return 60;
}
