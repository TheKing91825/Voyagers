"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DESTINATIONS = [
    {
        id: 1,
        name: "Bali",
        country: "Indonesia",
        description:
            "Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2838&auto=format&fit=crop",
    },
    {
        id: 2,
        name: "Tokyo",
        country: "Japan",
        description:
            "A bustling metropolis mixing ultramodern neon-lit skyscrapers with historic temples and opulent Meiji Shinto Shrine.",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2838&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Santorini",
        country: "Greece",
        description:
            "Famous for its whitewashed houses carved into the rugged clifftops overlooking an underwater caldera.",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2838&auto=format&fit=crop",
    },
    {
        id: 4,
        name: "Machu Picchu",
        country: "Peru",
        description:
            "A 15th-century Inca citadel, located in the Eastern Cordillera of southern Peru on a 2,430-meter mountain ridge.",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2838&auto=format&fit=crop",
    },
];

export function HeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(interval);
    }, [activeIndex]);

    const nextSlide = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % DESTINATIONS.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + DESTINATIONS.length) % DESTINATIONS.length);
    };

    const activeDest = DESTINATIONS[activeIndex];
    const nextDest = DESTINATIONS[(activeIndex + 1) % DESTINATIONS.length];

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Background Image Layer */}
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={activeDest.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${activeDest.image})` }}
                    />
                    {/* Gradient Overlay for Text Readability - subtle teal tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Main Content Layer */}
            <div className="relative z-10 container h-full flex flex-col justify-center pb-20 pt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

                    {/* Left: Main Text */}
                    <div className="lg:col-span-7 text-white space-y-6">
                        <motion.div
                            key={`text-${activeDest.id}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-12 h-[2px] bg-secondary" />
                                <span className="text-secondary font-medium tracking-widest uppercase text-sm">Destinations</span>
                            </div>

                            <h1 className="text-7xl md:text-9xl font-display font-bold leading-none tracking-tight mb-4 drop-shadow-xl">
                                {activeDest.name}
                            </h1>

                            <div className="flex items-center gap-2 text-xl font-medium mb-6 text-white/90">
                                <MapPin className="w-5 h-5 text-secondary" />
                                <span>{activeDest.country}</span>
                            </div>

                            <p className="max-w-xl text-lg text-white/80 leading-relaxed font-light backdrop-blur-sm bg-black/10 p-4 rounded-xl border border-white/10">
                                {activeDest.description}
                            </p>

                            <div className="pt-8 flex gap-4">
                                <Button
                                    size="lg"
                                    className="bg-secondary hover:bg-secondary/90 text-primary font-bold px-8 h-14 rounded-full transition-all duration-300 hover:scale-105"
                                    asChild
                                >
                                    <Link href={`/explore?q=${activeDest.name}`}>
                                        Explore Now <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="glass-panel text-white hover:bg-white/20 border-white/30 h-14 rounded-full px-8 backdrop-blur-md transition-all duration-300"
                                >
                                    View Details
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Next Slide Cards (Foxico Style) */}
                    <div className="lg:col-span-5 hidden lg:flex flex-col items-end gap-6">
                        {/* The "Next" Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="relative w-72 h-96 rounded-3xl overflow-hidden glass-panel cursor-pointer group hover:scale-[1.02] transition-transform duration-500"
                            onClick={nextSlide}
                        >
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${nextDest.image})` }}
                            />

                            <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-white/80 text-sm tracking-wider uppercase block mb-1">Next Destination</span>
                                <h3 className="text-2xl font-display font-bold text-white mb-2">{nextDest.name}</h3>
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-secondary group-hover:text-primary transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Slider Controls */}
                        <div className="flex items-center gap-4">
                            <div className="text-white font-mono text-sm">
                                <span className="text-2xl font-bold">0{activeDest.id}</span>
                                <span className="text-white/50 mx-2">/</span>
                                <span className="text-white/50">0{DESTINATIONS.length}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={prevSlide}
                                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
                <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
            </div>
        </div>
    );
}
