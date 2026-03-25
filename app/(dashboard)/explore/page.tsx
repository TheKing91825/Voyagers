"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { SwipeCard } from "@/components/explore/swipe-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, Heart, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Destination images for AI-generated results (reliable Unsplash IDs)
const DESTINATION_IMAGES: Record<string, string> = {
    "japan": "photo-1493976040374-85c8e12f0c0e",
    "greece": "photo-1570077188670-e3a8d69ac5ff",
    "iceland": "photo-1476610182048-b716b8518aae",
    "peru": "photo-1526392060635-9d6019884377",
    "italy": "photo-1476514525535-07fb3b4ae5f1",
    "france": "photo-1502602898657-3e91760cbb34",
    "thailand": "photo-1528072164453-f4e8ef0d475a",
    "morocco": "photo-1537996194471-e657df975ab4",
    "default": "photo-1469854523086-cc02fe5d8800",
};

function getImageForDestination(destination: string): string {
    const lower = destination.toLowerCase();
    for (const [key, photoId] of Object.entries(DESTINATION_IMAGES)) {
        if (lower.includes(key)) {
            return `https://images.unsplash.com/${photoId}?q=80&w=2070&auto=format&fit=crop`;
        }
    }
    return `https://images.unsplash.com/${DESTINATION_IMAGES.default}?q=80&w=2070&auto=format&fit=crop`;
}

// Pool of destinations to rotate through for AI generation
const DESTINATION_POOL = [
    "Kyoto, Japan",
    "Santorini, Greece",
    "Reykjavik, Iceland",
    "Cusco, Peru",
    "Amalfi Coast, Italy",
    "Marrakech, Morocco",
    "Bali, Indonesia",
    "Barcelona, Spain",
    "Cape Town, South Africa",
    "Queenstown, New Zealand",
    "Dubrovnik, Croatia",
    "Havana, Cuba",
    "Chiang Mai, Thailand",
    "Lisbon, Portugal",
    "Buenos Aires, Argentina",
];

interface ExploreDestination {
    id: string;
    name: string;
    country: string;
    imageUrl: string;
    matchScore: number;
    description: string;
    tags: string[];
}

// Fallback mock destinations if API fails
const FALLBACK_DESTINATIONS: ExploreDestination[] = [
    {
        id: "1",
        name: "Kyoto",
        country: "Japan",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
        matchScore: 98,
        description: "Experience the perfect blend of ancient traditions and modern life. Visit Fushimi Inari Shrine and walk through thousands of vermilion torii gates.",
        tags: ["Culture", "History", "Nature"]
    },
    {
        id: "2",
        name: "Santorini",
        country: "Greece",
        imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop",
        matchScore: 94,
        description: "Famous for its whitewashed houses and blue domes. Watch the world's most beautiful sunset in Oia and swim in volcanic beaches.",
        tags: ["Romance", "Beach", "Luxury"]
    },
    {
        id: "3",
        name: "Reykjavik",
        country: "Iceland",
        imageUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2759&auto=format&fit=crop",
        matchScore: 89,
        description: "Gateway to the Aurora Borealis. Explore geysers, waterfalls and the Blue Lagoon in this land of fire and ice.",
        tags: ["Adventure", "Nature", "Cold"]
    },
    {
        id: "4",
        name: "Machu Picchu",
        country: "Peru",
        imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop",
        matchScore: 85,
        description: "The Lost City of the Incas. Hike the Inca Trail and witness breathtaking views of the Andes Mountains.",
        tags: ["History", "Hiking", "Mountain"]
    }
];

export default function ExplorePage() {
    const [destinations, setDestinations] = useState<ExploreDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [poolIndex, setPoolIndex] = useState(0);

    // Get Firebase auth token
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const t = await user.getIdToken();
                setToken(t);
            } else {
                setToken(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch AI-generated destination activities
    const fetchDestinations = useCallback(async () => {
        setGenerating(true);

        // Pick destinations from the pool
        const count = 4;
        const selected: string[] = [];
        for (let i = 0; i < count; i++) {
            selected.push(DESTINATION_POOL[(poolIndex + i) % DESTINATION_POOL.length]);
        }
        setPoolIndex((prev) => (prev + count) % DESTINATION_POOL.length);

        if (!token) {
            setDestinations(FALLBACK_DESTINATIONS);
            setGenerating(false);
            setLoading(false);
            return;
        }

        try {
            // Make ONE API call for the first destination to get AI descriptions
            const primaryDest = selected[0];
            let aiActivities: any[] = [];
            
            try {
                const res = await fetch("/api/explore", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ destination: primaryDest, count: 5 }),
                });
                const data = await res.json();
                aiActivities = data.activities || [];
            } catch {
                // AI failed, continue with static descriptions
            }

            // Build cards for all selected destinations
            const cards: ExploreDestination[] = selected.map((dest, idx) => {
                const [city, country] = dest.split(", ");
                const activity = aiActivities[idx];
                
                return {
                    id: `${city}-${Date.now()}-${idx}`,
                    name: city,
                    country: country,
                    imageUrl: getImageForDestination(dest),
                    matchScore: Math.floor(Math.random() * 15) + 85,
                    description: activity?.description || `Discover the beauty of ${city}, ${country}. A perfect destination for your next adventure.`,
                    tags: activity
                        ? [activity.category || "sightseeing", activity.best_time?.toLowerCase() || "anytime"].filter(Boolean)
                        : ["Explore", "Travel"],
                };
            });

            setDestinations(cards);
        } catch {
            toast.error("Could not load suggestions. Using featured destinations.");
            setDestinations(FALLBACK_DESTINATIONS);
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    }, [token, poolIndex]);

    // Initial fetch
    useEffect(() => {
        if (token !== null || !loading) return;
        // Slight delay to let auth settle
        const timer = setTimeout(() => {
            if (!token) {
                setDestinations(FALLBACK_DESTINATIONS);
                setLoading(false);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [token, loading]);

    useEffect(() => {
        if (token) {
            fetchDestinations();
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const activeIndex = destinations.length - 1;

    const handleSwipe = (direction: "left" | "right") => {
        if (activeIndex < 0) return;

        const currentCard = destinations[activeIndex];

        if (direction === "right") {
            toast.success(`Saved ${currentCard.name} to bucket list! ✈️`);
            // TODO: Save to visited_locations via API
        }

        setDestinations((prev) => prev.slice(0, -1));
    };

    const handleRefresh = () => {
        fetchDestinations();
        toast.info("Generating new AI suggestions...");
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading destinations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-background flex flex-col items-center pt-24 pb-12 overflow-hidden">
            {/* Header */}
            <div className="mb-8 text-center space-y-2 z-10 px-4">
                <h1 className="text-4xl font-display font-bold text-primary">Discover & Explore</h1>
                <p className="text-muted-foreground">
                    {generating ? (
                        <span className="inline-flex items-center gap-2">
                            <Sparkles className="w-4 h-4 animate-pulse text-secondary" />
                            AI is curating destinations for you...
                        </span>
                    ) : (
                        "AI-curated destinations just for you. Swipe right to save."
                    )}
                </p>
            </div>

            {/* Card Stack */}
            <div className="relative w-full max-w-md aspect-[3/4] md:aspect-[4/5] mx-auto px-4">
                <AnimatePresence>
                    {destinations.length > 0 ? (
                        destinations.map((dest, index) => (
                            <SwipeCard
                                key={dest.id}
                                destination={dest}
                                active={index === activeIndex}
                                onSwipe={handleSwipe}
                            />
                        ))
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card text-card-foreground rounded-3xl shadow-sm border border-dashed border-border/60">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ready for more?</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                                Let our AI find your next perfect destination.
                            </p>
                            <Button onClick={handleRefresh} disabled={generating}>
                                {generating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Generate More
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            {destinations.length > 0 && (
                <div className="mt-8 flex gap-8 z-10">
                    <Button
                        size="lg"
                        className="h-16 w-16 rounded-full bg-red-500 border-2 border-red-500 text-white hover:bg-red-600 shadow-sm"
                        onClick={() => handleSwipe("left")}
                    >
                        <X className="w-8 h-8" />
                    </Button>
                    <Button
                        size="lg"
                        className="h-16 w-16 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl shadow-green-500/20"
                        onClick={() => handleSwipe("right")}
                    >
                        <Heart className="w-8 h-8 fill-current" />
                    </Button>
                </div>
            )}
        </div>
    );
}
