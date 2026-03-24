"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ProfileHeader } from "@/components/profile/profile-header";
import { VisitedMap } from "@/components/profile/visited-map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 1. Auth Check & Data Fetching
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
                return;
            }
            setUser(currentUser);

            try {
                const token = await currentUser.getIdToken();
                const res = await fetch("/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.profile);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
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

    // Mock data for places visited until API is populated
    const visitedLocations = profile?.visited_locations || [
        { id: '1', city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
        { id: '2', city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
        { id: '3', city: 'Bali', country: 'Indonesia', latitude: -8.3405, longitude: 115.0920 },
    ];

    const stats = {
        countries: visitedLocations.length, // Simple mock calc
        trips: 0,
        friends: 0
    };

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 md:px-6 space-y-8">
            {/* Header Section */}
            <ProfileHeader
                user={{
                    username: profile?.username || user.displayName || "Explorer",
                    avatar_url: profile?.avatar_url || user.photoURL,
                }}
                stats={stats}
                isOwnProfile={true}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* World Map Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-display font-bold text-primary">Travel Map</h2>
                            <span className="text-sm text-muted-foreground">{visitedLocations.length} places visited</span>
                        </div>
                        <VisitedMap locations={visitedLocations} />
                    </section>

                    {/* Tabs Section */}
                    <Tabs defaultValue="trips" className="w-full">
                        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-6">
                            <TabsTrigger
                                value="trips"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-foreground rounded-none px-6 py-3 text-muted-foreground text-base capitalize"
                            >
                                My Trips
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-foreground rounded-none px-6 py-3 text-muted-foreground text-base capitalize"
                            >
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger
                                value="bucketlist"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-foreground rounded-none px-6 py-3 text-muted-foreground text-base capitalize"
                            >
                                Bucket List
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="trips" className="mt-0">
                            <div className="text-center py-12 bg-muted rounded-2xl border border-dashed border-border/60">
                                <p className="text-muted-foreground">No trips planned yet. Start exploring!</p>
                                <Button className="mt-4 bg-primary text-white" onClick={() => router.push('/explore')}>
                                    Plan a Trip
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="reviews">
                            <p className="text-muted-foreground">No reviews yet.</p>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Friends Widget */}
                    <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-border">
                        <h3 className="font-bold mb-4 text-primary">Friends</h3>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Connect with friends to see their travels.</p>
                            <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                                Find Friends
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
