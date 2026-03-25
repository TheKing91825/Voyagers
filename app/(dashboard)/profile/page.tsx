"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ProfileHeader } from "@/components/profile/profile-header";
import { VisitedMap } from "@/components/profile/visited-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/social/review-card";
import { SuggestedFriends } from "@/components/social/suggested-friends";
import { Loader2, MapPin, Star, Compass, Plane } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Data fetched from APIs
    const [myTrips, setMyTrips] = useState<any[]>([]);
    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [visitedLocations, setVisitedLocations] = useState<any[]>([]);
    const [friendCount, setFriendCount] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
                return;
            }
            setFirebaseUser(currentUser);

            try {
                const t = await currentUser.getIdToken();
                setToken(t);

                // Fetch profile first (need user_id for reviews)
                const profileRes = await fetch("/api/profile", {
                    headers: { Authorization: `Bearer ${t}` },
                });
                let profileData: any = null;
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    profileData = data.profile;
                    setProfile(profileData);
                    setVisitedLocations(profileData?.visited_locations || []);
                }

                // Fetch trips, reviews (filtered by user_id), and friends in parallel
                const [tripsRes, reviewsRes, socialRes] = await Promise.all([
                    fetch("/api/trips", { headers: { Authorization: `Bearer ${t}` } }),
                    fetch(`/api/social/reviews${profileData?.id ? `?user_id=${profileData.id}` : ""}`, {
                        headers: { Authorization: `Bearer ${t}` },
                    }),
                    fetch("/api/social", { headers: { Authorization: `Bearer ${t}` } }),
                ]);

                if (tripsRes.ok) {
                    const data = await tripsRes.json();
                    setMyTrips([...(data.owned || []), ...(data.collaborating || [])]);
                }

                if (reviewsRes.ok) {
                    const data = await reviewsRes.json();
                    setMyReviews(data.reviews || []);
                }

                if (socialRes.ok) {
                    const data = await socialRes.json();
                    setFriendCount((data.friends || []).length);
                }
            } catch {
                // silently handle
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!firebaseUser) return null;

    const username = profile?.username || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Explorer";
    const avatarUrl = profile?.avatar_url || firebaseUser.photoURL || undefined;

    // Compute unique countries from visited locations
    const uniqueCountries = new Set(visitedLocations.map((l: any) => l.country)).size;

    const stats = {
        countries: uniqueCountries || visitedLocations.length,
        trips: myTrips.length,
        friends: friendCount,
    };

    // Map reviews to ReviewCard format
    const mappedReviews = myReviews
        .map((r: any) => ({
            id: r.id,
            user: {
                username: r.users?.username || username,
                avatar_url: r.users?.avatar_url || avatarUrl,
            },
            city: r.city,
            country: r.country,
            rating: r.rating,
            content: r.body || r.content || "",
            images: r.photo_urls || [],
            likes: 0,
            comments: (r.comments || []).length,
            createdAt: formatTimeAgo(r.created_at),
        }));

    return (
        <div className="container max-w-5xl mx-auto pt-24 pb-8 px-4 md:px-6 space-y-8">
            {/* Header Section */}
            <ProfileHeader
                user={{
                    username,
                    avatar_url: avatarUrl,
                }}
                stats={stats}
                isOwnProfile={true}
            />

            {/* Mobile-only visible name (desktop name is in ProfileHeader overlay) */}
            <div className="md:hidden -mt-4">
                {/* This space accommodates ProfileHeader absolute positioning on mobile */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* World Map Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold text-foreground">Travel Map</h2>
                            <span className="text-sm text-muted-foreground">{visitedLocations.length} places visited</span>
                        </div>
                        <VisitedMap locations={visitedLocations.length > 0 ? visitedLocations : [
                            { id: '1', city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
                            { id: '2', city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
                            { id: '3', city: 'Bali', country: 'Indonesia', latitude: -8.3405, longitude: 115.0920 },
                        ]} />
                    </section>

                    {/* Tabs Section */}
                    <Tabs defaultValue="trips" className="w-full">
                        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-6">
                            <TabsTrigger
                                value="trips"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-6 py-3 text-muted-foreground text-base"
                            >
                                <Plane className="w-4 h-4 mr-2" />
                                My Trips ({myTrips.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-6 py-3 text-muted-foreground text-base"
                            >
                                <Star className="w-4 h-4 mr-2" />
                                Reviews ({mappedReviews.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="bucketlist"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground rounded-none px-6 py-3 text-muted-foreground text-base"
                            >
                                <Compass className="w-4 h-4 mr-2" />
                                Bucket List ({visitedLocations.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Trips Tab */}
                        <TabsContent value="trips" className="mt-0">
                            {myTrips.length > 0 ? (
                                <div className="space-y-3">
                                    {myTrips.map((trip: any) => (
                                        <Link key={trip.id} href={`/my-trips/${trip.id}`}>
                                            <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow group cursor-pointer">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <Plane className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-foreground truncate">{trip.name}</h4>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {trip.destination}
                                                    </p>
                                                </div>
                                                {trip.start_date && (
                                                    <span className="text-xs text-muted-foreground hidden sm:block">
                                                        {new Date(trip.start_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted rounded-2xl border border-dashed border-border/60">
                                    <Plane className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">No trips planned yet. Start exploring!</p>
                                    <Button className="bg-primary text-white" onClick={() => router.push('/my-trips')}>
                                        Plan a Trip
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Reviews Tab */}
                        <TabsContent value="reviews" className="mt-0">
                            {mappedReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {mappedReviews.map((review: any) => (
                                        <ReviewCard key={review.id} review={review} token={token} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted rounded-2xl border border-dashed border-border/60">
                                    <Star className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">No reviews yet. Share your travel experiences!</p>
                                    <Button className="bg-primary text-white" onClick={() => router.push('/social')}>
                                        Write a Review
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Bucket List Tab */}
                        <TabsContent value="bucketlist" className="mt-0">
                            {visitedLocations.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {visitedLocations.map((loc: any) => (
                                        <div key={loc.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-sm transition-shadow">
                                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-foreground truncate">{loc.city}</p>
                                                <p className="text-xs text-muted-foreground">{loc.country}</p>
                                            </div>
                                            {loc.visited_at && (
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {new Date(loc.visited_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted rounded-2xl border border-dashed border-border/60">
                                    <Compass className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">No places saved yet. Swipe right on the Explore page to add destinations!</p>
                                    <Button className="bg-primary text-white" onClick={() => router.push('/explore')}>
                                        Explore Destinations
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Friends Widget - uses the full SuggestedFriends component */}
                    <SuggestedFriends />
                </div>
            </div>
        </div>
    );
}

function formatTimeAgo(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
