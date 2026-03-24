"use client";

import { Activity, ActivityCard } from "@/components/trips/activity-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DayItinerary {
    dayId: string;
    date: string; // e.g., "Day 1 - June 15"
    activities: Activity[];
}

interface ItineraryViewProps {
    days: DayItinerary[];
}

export function ItineraryView({ days }: ItineraryViewProps) {
    return (
        <div className="space-y-8 relative">
            {/* Vertical Timeline Line (Desktop) */}
            <div className="absolute left-[88px] top-0 bottom-0 w-px bg-border hidden md:block" />

            {days.map((day) => (
                <div key={day.dayId} className="relative">
                    {/* Day Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-[100px] text-right font-display font-bold text-xl text-primary md:pr-8">
                            {day.date.split(" - ")[0]}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-muted-foreground">{day.date.split(" - ")[1]}</h3>
                        </div>
                    </div>

                    <div className="md:pl-[100px] space-y-4">
                        {day.activities.length > 0 ? (
                            day.activities.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))
                        ) : (
                            <div className="p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-gray-50/50">
                                <p className="text-muted-foreground mb-4">No activities planned for this day.</p>
                                <Button variant="outline" className="border-primary/20 text-primary">
                                    <Plus className="w-4 h-4 mr-2" /> Add Activity
                                </Button>
                            </div>
                        )}

                        {day.activities.length > 0 && (
                            <div className="flex justify-center pt-2">
                                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                                    <Plus className="w-4 h-4 mr-2" /> Add to {day.date.split(" - ")[0]}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
