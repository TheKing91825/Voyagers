"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DESTINATIONS = [
    {
        name: "Istanbul, Turkey",
        tours: "22 Tours",
        rating: 5,
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2949&auto=format&fit=crop",
    },
    {
        name: "Sydney, Australia",
        tours: "14 Tours",
        rating: 5,
        image: "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=2942&auto=format&fit=crop",
    },
    {
        name: "London, England",
        tours: "9 Tours",
        rating: 5,
        image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=2940&auto=format&fit=crop",
    },
    {
        name: "Paris, France",
        tours: "12 Tours",
        rating: 5,
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2802&auto=format&fit=crop",
    },
];

export function PopularDestinations() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Decorative Background Elements from "Tourm" */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary font-medium tracking-wider uppercase text-sm mb-2 block">Top Destinations</span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        Popular <span className="text-primary">Destinations</span>
                    </h2>
                    <p className="text-muted text-lg font-light">
                        Bringing adventures to your journey with all outdoor destinations on the world as our specialties.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {DESTINATIONS.map((dest, i) => (
                        <Link key={dest.name} href={`/explore?q=${encodeURIComponent(dest.name.split(",")[0].trim())}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image Background */}
                            <div className="absolute inset-0">
                                <Image
                                    src={dest.image}
                                    alt={dest.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Content Card (Floating like "Tourm") */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="bg-card text-card-foreground rounded-2xl p-4 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 relative z-20">
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                        <Star className="w-3 h-3 fill-current" /> {dest.rating}
                                    </div>

                                    <h3 className="text-center font-display font-bold text-lg text-foreground mb-1">
                                        {dest.name}
                                    </h3>
                                    <p className="text-center text-muted text-sm font-medium">
                                        {dest.tours}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
