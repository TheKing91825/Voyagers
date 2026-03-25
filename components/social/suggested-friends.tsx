"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Check, X, Loader2, Users, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";

interface Friend {
    id: string;
    username: string;
    avatar_url?: string;
}

interface PendingRequest {
    id: string;
    sender_id: string;
    users: {
        username: string;
        avatar_url?: string;
    };
}

export function SuggestedFriends() {
    const [token, setToken] = useState<string | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pending, setPending] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Friend[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    // Tab state
    const [tab, setTab] = useState<"friends" | "find" | "pending">("friends");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const t = await user.getIdToken();
                setToken(t);

                // Fetch social data (friends + pending requests)
                const res = await fetch("/api/social", {
                    headers: { Authorization: `Bearer ${t}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setFriends(data.friends || []);
                    setPending(data.pending_requests || []);
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !token) return;

        setSearching(true);
        try {
            const res = await fetch(`/api/social/search?q=${encodeURIComponent(searchQuery.trim())}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
                if ((data.users || []).length === 0) {
                    toast("No users found for that search.");
                }
            }
        } catch {
            toast.error("Search failed.");
        } finally {
            setSearching(false);
        }
    };

    const handleAddFriend = async (username: string) => {
        if (!token) {
            toast.error("Please log in.");
            return;
        }

        try {
            const res = await fetch("/api/social/friends", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ receiver_username: username }),
            });

            if (res.ok) {
                setSentRequests((prev) => new Set(prev).add(username));
                toast.success(`Friend request sent to ${username}! 🤝`);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Could not send request.");
            }
        } catch {
            toast.error("Network error.");
        }
    };

    const handleRespondRequest = async (requestId: string, action: "accepted" | "rejected") => {
        if (!token) return;

        try {
            const res = await fetch("/api/social/friends", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ request_id: requestId, action }),
            });

            if (res.ok) {
                setPending((prev) => prev.filter((r) => r.id !== requestId));
                if (action === "accepted") {
                    toast.success("Friend request accepted! 🎉");
                    // Refresh friends list
                    const socialRes = await fetch("/api/social", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (socialRes.ok) {
                        const data = await socialRes.json();
                        setFriends(data.friends || []);
                    }
                } else {
                    toast("Request declined.");
                }
            }
        } catch {
            toast.error("Failed to respond.");
        }
    };

    const handleRemoveFriend = async (friendId: string, username: string) => {
        if (!token) return;

        try {
            const res = await fetch("/api/social/friends", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ friend_id: friendId }),
            });

            if (res.ok) {
                setFriends((prev) => prev.filter((f) => f.id !== friendId));
                toast.success(`Removed ${username} from friends.`);
            }
        } catch {
            toast.error("Failed to remove friend.");
        }
    };

    if (loading) {
        return (
            <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border">
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
                <button
                    onClick={() => setTab("friends")}
                    className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${tab === "friends" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Users className="w-3 h-3 inline mr-1" />
                    Friends ({friends.length})
                </button>
                <button
                    onClick={() => setTab("find")}
                    className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${tab === "find" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Search className="w-3 h-3 inline mr-1" />
                    Find
                </button>
                <button
                    onClick={() => setTab("pending")}
                    className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors relative ${tab === "pending" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Clock className="w-3 h-3 inline mr-1" />
                    Pending
                    {pending.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {pending.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Friends Tab */}
            {tab === "friends" && (
                <div className="space-y-3">
                    {friends.length === 0 ? (
                        <div className="text-center py-4">
                            <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No friends yet. Use the Find tab to search!</p>
                        </div>
                    ) : (
                        friends.map((friend) => (
                            <div key={friend.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={friend.avatar_url || undefined} />
                                        <AvatarFallback className="text-xs">{(friend.username || "?")[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium text-foreground">{friend.username}</p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRemoveFriend(friend.id, friend.username)}
                                    className="h-7 w-7 text-muted-foreground/0 group-hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Find Tab */}
            {tab === "find" && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="text-sm h-9"
                        />
                        <Button size="sm" onClick={handleSearch} disabled={searching || !searchQuery.trim()} className="h-9 px-3">
                            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        </Button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="space-y-2 mt-2">
                            {searchResults.map((user) => {
                                const isFriend = friends.some((f) => f.id === user.id);
                                const isSent = sentRequests.has(user.username);

                                return (
                                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar_url || undefined} />
                                                <AvatarFallback className="text-xs">{user.username[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm font-medium text-foreground">{user.username}</p>
                                        </div>

                                        {isFriend ? (
                                            <span className="text-xs text-green-500 flex items-center gap-1">
                                                <UserCheck className="w-3 h-3" /> Friends
                                            </span>
                                        ) : isSent ? (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Sent
                                            </span>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleAddFriend(user.username)}
                                                className="h-7 text-primary hover:bg-primary/10 text-xs"
                                            >
                                                <UserPlus className="w-3 h-3 mr-1" /> Add
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Pending Tab */}
            {tab === "pending" && (
                <div className="space-y-3">
                    {pending.length === 0 ? (
                        <div className="text-center py-4">
                            <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No pending requests.</p>
                        </div>
                    ) : (
                        pending.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={req.users?.avatar_url || undefined} />
                                        <AvatarFallback className="text-xs">{(req.users?.username || "?")[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium text-foreground">{req.users?.username}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRespondRequest(req.id, "accepted")}
                                        className="h-7 w-7 text-green-500 hover:bg-green-50 rounded-full"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRespondRequest(req.id, "rejected")}
                                        className="h-7 w-7 text-red-400 hover:bg-red-50 rounded-full"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
