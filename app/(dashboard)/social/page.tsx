"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ReviewCard } from "@/components/social/review-card";
import { SuggestedFriends } from "@/components/social/suggested-friends";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Star, Pen } from "lucide-react";
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

// Fallback mock data
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
    const [reviews, setReviews] = useState<any[]>(MOCK_REVIEWS);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Review form state
    const [reviewCity, setReviewCity] = useState("");
    const [reviewCountry, setReviewCountry] = useState("");
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewBody, setReviewBody] = useState("");
    const [reviewRating, setReviewRating] = useState(5);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setReviews(MOCK_REVIEWS);
                setLoading(false);
                return;
            }

            try {
                const t = await user.getIdToken();
                setToken(t);

                const res = await fetch("/api/social/reviews", {
                    headers: { Authorization: `Bearer ${t}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.reviews && data.reviews.length > 0) {
                        const mapped = data.reviews.map((r: any) => ({
                            id: r.id,
                            user: {
                                username: r.users?.username || "traveler",
                                avatar_url: r.users?.avatar_url || null,
                            },
                            city: r.city,
                            country: r.country,
                            rating: r.rating,
                            title: r.title || null,
                            content: r.body,
                            images: r.image_urls || [],
                            likes: r.likes_count || 0,
                            comments: r.comments_count || 0,
                            createdAt: formatTimeAgo(r.created_at),
                        }));
                        setReviews([...mapped, ...MOCK_REVIEWS]);
                    }
                }
            } catch {
                // Keep mock data
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async () => {
        if (!reviewCity.trim() || !reviewBody.trim()) {
            toast.error("Please fill in the destination and review.");
            return;
        }

        if (!token) {
            toast.error("Please log in to post a review.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/social/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    city: reviewCity.trim(),
                    country: reviewCountry.trim() || "Unknown",
                    title: reviewTitle.trim() || null,
                    body: reviewBody.trim(),
                    rating: reviewRating,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("Review posted successfully! ✍️");

                // Add to the top of the feed
                const currentUser = auth.currentUser;
                setReviews((prev) => [
                    {
                        id: data.review?.id || Date.now().toString(),
                        user: {
                            username: currentUser?.displayName || currentUser?.email?.split("@")[0] || "you",
                            avatar_url: currentUser?.photoURL || null,
                        },
                        city: reviewCity.trim(),
                        country: reviewCountry.trim() || "Unknown",
                        rating: reviewRating,
                        title: reviewTitle.trim() || null,
                        content: reviewBody.trim(),
                        images: [],
                        likes: 0,
                        comments: 0,
                        createdAt: "just now",
                    },
                    ...prev,
                ]);

                // Reset form
                setReviewCity("");
                setReviewCountry("");
                setReviewTitle("");
                setReviewBody("");
                setReviewRating(5);
                setIsReviewOpen(false);
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to post review.");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                placeholder="e.g. Kyoto"
                                                value={reviewCity}
                                                onChange={(e) => setReviewCity(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                placeholder="e.g. Japan"
                                                value={reviewCountry}
                                                onChange={(e) => setReviewCountry(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Rating</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="p-1 transition-colors"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="review-title">Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                        <Input
                                            id="review-title"
                                            placeholder="e.g. Best weekend ever!"
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="review-body">Your Review *</Label>
                                        <textarea
                                            id="review-body"
                                            placeholder="Tell us about your experience..."
                                            value={reviewBody}
                                            onChange={(e) => setReviewBody(e.target.value)}
                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Post Review
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} token={token} />
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

function formatTimeAgo(dateStr: string): string {
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
