import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, GripVertical, MoreHorizontal } from "lucide-react";

export type ActivityType = "flight" | "hotel" | "food" | "attraction";

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    time: string;
    location: string;
    description?: string;
    cost?: number;
}

interface ActivityCardProps {
    activity: Activity;
}

const TYPE_COLORS = {
    flight: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    hotel: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    food: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    attraction: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function ActivityCard({ activity }: ActivityCardProps) {
    return (
        <Card className="flex items-start gap-4 p-4 mb-4 border border-border shadow-sm hover:shadow-md transition-shadow group bg-card text-card-foreground">
            {/* Drag Handle */}
            <div className="mt-1 text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Time Column */}
            <div className="flex flex-col items-center min-w-[60px] pt-1">
                <span className="font-bold text-foreground">{activity.time}</span>
                <div className="h-full w-px bg-border my-2 block md:hidden" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${TYPE_COLORS[activity.type]}`}>
                        {activity.type}
                    </span>
                </div>

                <h4 className="font-bold text-lg truncate">{activity.title}</h4>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {activity.location}
                    </span>
                    {activity.cost && (
                        <span className="font-medium text-foreground">
                            ${activity.cost}
                        </span>
                    )}
                </div>

                {activity.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {activity.description}
                    </p>
                )}
            </div>

            {/* Actions */}
            <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreHorizontal className="w-5 h-5" />
            </Button>
        </Card>
    );
}
