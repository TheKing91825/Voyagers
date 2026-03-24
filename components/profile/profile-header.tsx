import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Settings, Share2, UserPlus } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
    user: {
        username: string;
        avatar_url?: string;
        description?: string; // Optional bio
    };
    stats: {
        countries: number;
        trips: number;
        friends: number;
    };
    isOwnProfile?: boolean;
}

export function ProfileHeader({ user, stats, isOwnProfile = false }: ProfileHeaderProps) {
    return (
        <div className="relative mb-20 bg-white rounded-3xl overflow-hidden shadow-sm border border-border/50">
            {/* Cover Image */}
            <div className="h-48 md:h-64 relative w-full bg-gray-100">
                <Image
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
                    alt="Profile Cover"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Profile Info (Floating Overlap) */}
            <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-6 z-10">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={user.avatar_url} alt={user.username} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-secondary text-primary font-display font-bold">
                        {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="mb-4 hidden md:block text-white drop-shadow-md">
                    <h1 className="text-3xl font-display font-bold">{user.username}</h1>
                    <p className="text-white/90 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" /> Global Citizen
                    </p>
                </div>
            </div>

            {/* Mobile Name (Below Image) */}
            <div className="md:hidden pt-20 px-6 pb-4">
                <h1 className="text-2xl font-display font-bold text-foreground">{user.username}</h1>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" /> Global Citizen
                </p>
            </div>

            {/* Actions (Top Right) */}
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="icon" className="shadow-lg backdrop-blur-md bg-white/20 hover:bg-white/40 text-white border-none rounded-full">
                    <Share2 className="w-5 h-5" />
                </Button>
                {isOwnProfile && (
                    <Button variant="secondary" size="icon" className="shadow-lg backdrop-blur-md bg-white/20 hover:bg-white/40 text-white border-none rounded-full">
                        <Settings className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Stats Bar */}
            <div className="flex justify-end items-center p-4 md:p-6 bg-white min-h-[80px]">
                <div className="flex gap-8 mr-4 md:mr-10">
                    <div className="text-center">
                        <div className="text-xl font-bold text-primary">{stats.countries}</div>
                        <div className="text-xs text-muted-foreground tracking-wider uppercase">Countries</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-primary">{stats.trips}</div>
                        <div className="text-xs text-muted-foreground tracking-wider uppercase">Trips</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-primary">{stats.friends}</div>
                        <div className="text-xs text-muted-foreground tracking-wider uppercase">Friends</div>
                    </div>
                </div>
                {!isOwnProfile && (
                    <Button className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-md">
                        <UserPlus className="w-4 h-4 mr-2" /> Follow
                    </Button>
                )}
            </div>
        </div>
    );
}
