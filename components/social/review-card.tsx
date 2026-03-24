import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MapPin, MoreHorizontal } from "lucide-react";
import Image from "next/image";

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
}

export function ReviewCard({ review }: ReviewCardProps) {
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
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreHorizontal className="w-5 h-5" />
                </Button>
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
            <CardFooter className="p-4 pt-0 flex justify-between border-t border-gray-50 mt-2">
                <div className="flex gap-4 pt-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-50 px-2">
                        <Heart className="w-5 h-5 mr-1" />
                        <span className="text-xs">{review.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 px-2">
                        <MessageCircle className="w-5 h-5 mr-1" />
                        <span className="text-xs">{review.comments}</span>
                    </Button>
                </div>
                <div className="pt-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
