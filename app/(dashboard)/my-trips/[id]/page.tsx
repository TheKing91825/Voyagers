"use client";

import { useState } from "react";
import { ItineraryView } from "@/components/trips/itinerary-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Share2, UserPlus, Calendar, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Activity } from "@/components/trips/activity-card";

// Mock Data
const MOCK_TRIP = {
    id: "1",
    title: "Summer in Tuscany",
    destination: "Tuscany, Italy",
    imageUrl: "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1974&auto=format&fit=crop",
    dates: "June 15 - June 25, 2026",
    countdown: "118 Days to go",
    collaborators: [
        { id: "101", username: "emma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop" },
        { id: "102", username: "alex", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop" }
    ]
};

const MOCK_DAYS = [
    {
        dayId: "d1",
        date: "Day 1 - June 15",
        activities: [
            { id: "a1", type: "flight", title: "Flight to Florence (FLR)", time: "10:00 AM", location: "JFK Airport", description: "Flight AZ610 - Terminal 4", cost: 450 } as Activity,
            { id: "a2", type: "hotel", title: "Check-in: Villa Cora", time: "03:00 PM", location: "Florence, Italy", description: "luxury villa with pool" } as Activity,
            { id: "a3", type: "food", title: "Dinner at La Giostra", time: "08:00 PM", location: "Borgo Pinti", description: "Reservation confirmed for 4 pax" } as Activity,
        ]
    },
    {
        dayId: "d2",
        date: "Day 2 - June 16",
        activities: [
            { id: "a4", type: "attraction", title: "Uffizi Gallery Tour", time: "09:30 AM", location: "Uffizi Gallery", description: "Skip-the-line tickets booked", cost: 40 } as Activity,
        ]
    }
];

export default function TripDetailPage({ params }: { params: { id: string } }) {
    // In real app, fetch trip by params.id

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative h-[40vh] w-full">
                <Image
                    src={MOCK_TRIP.imageUrl}
                    alt={MOCK_TRIP.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="absolute top-6 left-6 z-20">
                    <Link href="/my-trips">
                        <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/40 text-white backdrop-blur border-none">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    </Link>
                </div>

                <div className="container max-w-5xl mx-auto absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-sm font-medium uppercase tracking-wider">
                                <Calendar className="w-4 h-4" /> {MOCK_TRIP.dates} • {MOCK_TRIP.countdown}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-2">{MOCK_TRIP.title}</h1>
                            <p className="text-lg flex items-center gap-2 text-white/90">
                                <MapPin className="w-5 h-5" /> {MOCK_TRIP.destination}
                            </p>
                        </div>

                        {/* Collaborators */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {MOCK_TRIP.collaborators.map(c => (
                                    <Avatar key={c.id} className="w-10 h-10 border-2 border-white">
                                        <AvatarImage src={c.avatar} />
                                        <AvatarFallback>{c.username[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                                <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white border-2 border-dashed border-white/50 backdrop-blur">
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button className="rounded-full bg-secondary text-primary hover:bg-secondary/80 font-bold">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-5xl mx-auto px-4 py-8 md:px-6 -mt-8 relative z-20">
                <div className="bg-card text-card-foreground rounded-3xl shadow-xl min-h-[500px] border border-border overflow-hidden">
                    <Tabs defaultValue="itinerary" className="w-full">
                        <div className="border-b border-border bg-muted/50 px-6 py-2">
                            <TabsList className="bg-transparent">
                                <TabsTrigger value="itinerary" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Itinerary</TabsTrigger>
                                <TabsTrigger value="budget" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Budget</TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Settings</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="itinerary" className="p-6 md:p-10 focus-visible:ring-0">
                            <ItineraryView days={MOCK_DAYS} />
                        </TabsContent>

                        <TabsContent value="budget" className="p-10 text-center text-muted-foreground">
                            Budget tracking coming soon.
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
