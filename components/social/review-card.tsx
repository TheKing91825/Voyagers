"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MapPin, MoreHorizontal, Send, Check, Copy } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Review {
    id: string;
    user: {
        username: string;
        avatar_url?: string;
    };
    city: string;
    country: string;
    rating: number;
    content: string;
    images?: string[];
    likes: number;
    comments: number;
    createdAt: string;
}

interface ReviewCardProps {
    review: Review;
    token?: string | null;
}

export function ReviewCard({ review, token }: ReviewCardProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(review.likes);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(review.comments);
    const [localComments, setLocalComments] = useState<{ username: string; text: string }[]>([]);
    const [submittingComment, setSubmittingComment] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        if (!liked) {
            toast.success("Liked! ❤️");
        }
    };

    const handleShare = async () => {
        const shareText = `Check out ${review.user.username}'s review of ${review.city}, ${review.country} on Voyager! ✈️`;
        const shareUrl = `${window.location.origin}/social?review=${review.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${review.city} Review by ${review.user.username}`,
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // User cancelled share
            }
        } else {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast.success("Link copied to clipboard! 📋");
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;

        if (!token) {
            toast.error("Please log in to comment.");
            return;
        }

        setSubmittingComment(true);
        try {
            const res = await fetch("/api/social/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    review_id: review.id,
                    body: commentText.trim(),
                }),
            });

            if (res.ok) {
                setLocalComments((prev) => [...prev, { username: "You", text: commentText.trim() }]);
                setCommentCount((prev) => prev + 1);
                setCommentText("");
                toast.success("Comment added!");
            } else {
                // If it fails (e.g. mock review), still show locally
                setLocalComments((prev) => [...prev, { username: "You", text: commentText.trim() }]);
                setCommentCount((prev) => prev + 1);
                setCommentText("");
            }
        } catch {
            setLocalComments((prev) => [...prev, { username: "You", text: commentText.trim() }]);
            setCommentCount((prev) => prev + 1);
            setCommentText("");
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-card text-card-foreground">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                        <AvatarImage src={review.user.avatar_url} alt={review.user.username} />
                        <AvatarFallback>{review.user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm text-foreground">{review.user.username}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-secondary" /> {review.city}, {review.country}
                            <span className="ml-1">· {review.createdAt}</span>
                        </p>
                    </div>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-4 space-y-3">
                {/* Rating Stars */}
                <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                    ))}
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed">
                    {review.content}
                </p>

                {/* Images Grid */}
                {review.images && review.images.length > 0 && (
                    <div className={`grid gap-2 mt-3 ${review.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {review.images.slice(0, 2).map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={img}
                                    alt="Review image"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                        {review.images.length > 2 && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-muted-foreground">+{review.images.length - 2} more</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Footer Actions */}
            <CardFooter className="p-4 pt-0 flex flex-col border-t border-border/30 mt-2">
                <div className="flex justify-between w-full pt-3">
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`px-2 transition-colors ${liked ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}`}
                        >
                            <Heart className={`w-5 h-5 mr-1 ${liked ? "fill-current" : ""}`} />
                            <span className="text-xs">{likeCount}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(!showComments)}
                            className={`px-2 transition-colors ${showComments ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50" : "text-muted-foreground hover:text-blue-500 hover:bg-blue-50"}`}
                        >
                            <MessageCircle className={`w-5 h-5 mr-1 ${showComments ? "fill-current" : ""}`} />
                            <span className="text-xs">{commentCount}</span>
                        </Button>
                    </div>
                    <div className="pt-0">
                        <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-primary hover:bg-primary/5">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="w-full mt-3 space-y-3 border-t border-border/20 pt-3">
                        {/* Local comments */}
                        {localComments.map((c, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <Avatar className="h-6 w-6 mt-0.5">
                                    <AvatarFallback className="text-[10px]">{c.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-xl px-3 py-2 flex-1">
                                    <p className="text-xs font-semibold text-foreground">{c.username}</p>
                                    <p className="text-xs text-foreground/80">{c.text}</p>
                                </div>
                            </div>
                        ))}

                        {/* Comment input */}
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                                placeholder="Write a comment..."
                                className="flex-1 text-sm bg-muted rounded-full px-4 py-2 border-none outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim() || submittingComment}
                                className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
