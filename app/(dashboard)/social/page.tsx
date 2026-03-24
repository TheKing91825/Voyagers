"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/social/review-card";
import { SuggestedFriends } from "@/components/social/suggested-friends";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock Data for Feed
const MOCK_REVIEWS = [
    {
        id: "1",
        user: { username: "jessica_p", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
        city: "Kyoto",
        country: "Japan",
        rating: 5,
        content: "Absolutely fell in love with Arashiyama Bamboo Grove. It felt otherworldly! Make sure to go early to avoid the crowds.",
        images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop"],
        likes: 124,
        comments: 18,
        createdAt: "2h ago"
    },
    {
        id: "2",
        user: { username: "mike_explorer", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" },
        city: "New York",
        country: "USA",
        rating: 4,
        content: "The view from Summit One Vanderbilt is insane. A bit pricey but worth it for the experience.",
        images: [
            "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80&w=2000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=2000&auto=format&fit=crop"
        ],
        likes: 89,
        comments: 12,
        createdAt: "5h ago"
    },
    {
        id: "3",
        user: { username: "sarah_w", avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" },
        city: "Paris",
        country: "France",
        rating: 5,
        content: "Best croissant I've ever had at Du Pain et des Idées. The pistachio escargot is a must-try!",
        likes: 245,
        comments: 42,
        createdAt: "1d ago"
    }
];

export default function SocialPage() {
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const handleSubmit = () => {
        toast.success("Review posted successfully!");
        setIsReviewOpen(false);
    };

    return (
        <div className="container max-w-6xl mx-auto pt-24 pb-8 px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-display font-bold text-foreground">Activity Feed</h1>
                        
                        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-full bg-primary text-white shadow-md hover:bg-primary/90">
                                    <PlusCircle className="w-4 h-4 mr-2" /> Write Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Write a Review</DialogTitle>
                                    <DialogDescription>
                                        Share your travel experiences with friends.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="destination">Destination</Label>
                                        <Input id="destination" placeholder="e.g. Kyoto, Japan" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="review">Your Review</Label>
                                        <textarea
                                            id="review"
                                            placeholder="Tell us about it..."
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSubmit}>Post Review</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-6">
                        {MOCK_REVIEWS.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 hidden lg:block">
                    <SuggestedFriends />

                    {/* Trending Locations Widget */}
                    <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="font-bold text-lg mb-4 text-foreground">Trending Now</h3>
                        <ul className="space-y-3">
                            {["Bali, Indonesia", "Tulum, Mexico", "Lisbon, Portugal", "Tokyo, Japan"].map((place, i) => (
                                <li key={i} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2 transition-colors">
                                    <span className="text-foreground/80 font-medium">#{i + 1} {place}</span>
                                    <span className="text-xs text-muted-foreground">2.4k posts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
