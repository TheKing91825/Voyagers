"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "@/components/explore/swipe-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, Heart } from "lucide-react";
import { toast } from "sonner";

// TODO: Replace with Real AI API Data later
const MOCK_DESTINATIONS = [
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
    const [destinations, setDestinations] = useState(MOCK_DESTINATIONS);
    const [removedIds, setRemovedIds] = useState<string[]>([]); // Track swiped cards

    const activeIndex = destinations.length - 1;

    const handleSwipe = (direction: "left" | "right") => {
        if (activeIndex < 0) return;

        const currentCard = destinations[activeIndex];

        if (direction === "right") {
            toast.success(`Saved ${currentCard.name} to bucket list!`);
            // TODO: Save to database via API
        }

        setRemovedIds((prev) => [...prev, currentCard.id]);
        setDestinations((prev) => prev.slice(0, -1));
    };

    const resetStack = () => {
        setDestinations(MOCK_DESTINATIONS);
        setRemovedIds([]);
        toast.info("Refreshed suggestions!");
    };

    return (
        <div className="relative min-h-screen w-full bg-slate-50 flex flex-col items-center pt-24 pb-12 overflow-hidden">
            {/* Header */}
            <div className="mb-8 text-center space-y-2 z-10 px-4">
                <h1 className="text-4xl font-display font-bold text-primary">Discover & Explore</h1>
                <p className="text-muted-foreground">AI-curated destinations just for you. Swipe right to save.</p>
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-dashed border-border/60">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin-slow" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No more suggestions</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs text-center">
                                We've run out of recommendations for now. Check back later or adjust your preferences.
                            </p>
                            <Button onClick={resetStack}>Start Over</Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons (External Controls) */}
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
