"use client";

import { useState } from "react";
import { PanInfo, motion, useMotionValue, useTransform } from "framer-motion";
import { X, Heart, MapPin, Info } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SwipeCardProps {
    destination: {
        id: string;
        name: string;
        country: string;
        imageUrl: string;
        matchScore: number;
        description: string;
        tags: string[];
    };
    onSwipe: (direction: "left" | "right") => void;
    active: boolean;
}

export function SwipeCard({ destination, onSwipe, active }: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Indicators opacity
    const nopeOpacity = useTransform(x, [-150, -20], [1, 0]);
    const likeOpacity = useTransform(x, [20, 150], [0, 1]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe("right");
        } else if (info.offset.x < -threshold) {
            onSwipe("left");
        }
    };

    // Only the active card is draggable
    return (
        <motion.div
            style={{
                x: active ? x : 0,
                rotate: active ? rotate : 0,
                opacity,
                zIndex: active ? 10 : 0,
            }}
            drag={active ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-xl bg-card ${!active && "scale-95 opacity-50 blur-[1px]"
                }`}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Destination Image */}
            <div className="relative w-full h-full">
                <Image
                    src={destination.imageUrl}
                    alt={destination.name}
                    fill
                    className="object-cover"
                    priority={active}
                    draggable={false}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

                {/* Swipe Indicators */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2 rotate-[-15deg]">
                    <span className="text-4xl font-black text-green-500 uppercase tracking-widest">Like</span>
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2 rotate-[15deg]">
                    <span className="text-4xl font-black text-red-500 uppercase tracking-widest">Nope</span>
                </motion.div>

                {/* Content Info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-2 pointer-events-none">
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl font-display font-bold">{destination.name}</h2>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold border border-white/20">
                            {destination.matchScore}% Match
                        </div>
                    </div>

                    <p className="text-xl font-medium text-white/90 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-secondary" /> {destination.country}
                    </p>

                    <p className="line-clamp-2 text-white/80 text-sm md:text-base max-w-lg">
                        {destination.description}
                    </p>

                    <div className="flex flex-wrap gap-2 py-2">
                        {destination.tags.map(tag => (
                            <span key={tag} className="text-xs bg-black/40 px-2 py-1 rounded-md border border-white/10">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
