import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

interface Trip {
    id: string;
    title: string;
    destination: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    collaborators: { id: string; avatar_url: string; username: string }[];
    status: "upcoming" | "past" | "draft";
}

interface TripCardProps {
    trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
    const isUpcoming = trip.status === "upcoming";
    const dateRange = `${format(new Date(trip.startDate), "MMM d")} - ${format(new Date(trip.endDate), "MMM d, yyyy")}`;

    return (
        <Link href={`/my-trips/${trip.id}`}>
            <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                {/* Image Header */}
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={trip.imageUrl}
                        alt={trip.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 right-3">
                        <Badge variant={isUpcoming ? "default" : "secondary"} className={isUpcoming ? "bg-primary text-white" : "bg-white/80 backdrop-blur text-foreground"}>
                            {trip.status === 'upcoming' ? 'Coming Soon' : trip.status}
                        </Badge>
                    </div>

                    <div className="absolute bottom-3 left-4 text-white">
                        <h3 className="font-display font-bold text-xl drop-shadow-md">{trip.title}</h3>
                        <p className="text-sm font-medium flex items-center gap-1 opacity-90">
                            <MapPin className="w-3 h-3" /> {trip.destination}
                        </p>
                    </div>
                </div>

                <CardContent className="p-4 space-y-4">
                    {/* Date */}
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {dateRange}
                    </div>

                    {/* Collaborators */}
                    {trip.collaborators.length > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {trip.collaborators.slice(0, 3).map((collab) => (
                                    <Avatar key={collab.id} className="w-8 h-8 border-2 border-white">
                                        <AvatarImage src={collab.avatar_url} />
                                        <AvatarFallback>{collab.username[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {trip.collaborators.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-muted-foreground font-medium">
                                        +{trip.collaborators.length - 3}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">{trip.collaborators.length} travelers</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
