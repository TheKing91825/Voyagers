import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const MOCK_SUGGESTIONS = [
    { id: "1", username: "emma_travels", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop", mutual: 3 },
    { id: "2", username: "alex_adventures", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop", mutual: 1 },
    { id: "3", username: "sarah_w", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop", mutual: 5 },
];

export function SuggestedFriends() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="font-bold text-lg mb-4 text-foreground">Suggested for you</h3>
            <div className="space-y-4">
                {MOCK_SUGGESTIONS.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold">{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.mutual} mutual friends</p>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8">
                            <UserPlus className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-xs text-muted-foreground">
                See all suggestions
            </Button>
        </div>
    );
}
