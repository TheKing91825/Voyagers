"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";

// TODO: Move to env variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface VisitedLocation {
    id: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
}

interface VisitedMapProps {
    locations: VisitedLocation[];
    className?: string;
}

export function VisitedMap({ locations, className }: VisitedMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const { theme } = useTheme();
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11", // Default light style
            center: [0, 20], // Center on world
            zoom: 1.5, // Zoom out to see world
            projection: "globe", // Globe projection for 3D feel
            interactive: true,
            attributionControl: false,
        });

        map.current.on("load", () => {
            setMapLoaded(true);
            // Add fog for atmosphere
            map.current?.setFog({
                range: [1.0, 8.0],
                color: "white",
                "horizon-blend": 0.1,
            });
        });

        // Cleanup
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update markers when locations change
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear existing markers (if we were tracking them, but for now simple add)
        // Real implementation would track markers to remove/update them.

        locations.forEach((loc) => {
            // Create a DOM element for each marker.
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = '12px';
            el.style.height = '12px';
            el.style.backgroundColor = '#D4AF37'; // Soft Gold
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.3)';
            el.style.cursor = 'pointer';

            // Add popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setText(
                `${loc.city}, ${loc.country}`
            );

            new mapboxgl.Marker(el)
                .setLngLat([loc.longitude, loc.latitude])
                .setPopup(popup)
                .addTo(map.current!);
        });

    }, [locations, mapLoaded]);

    // Update map style based on theme
    useEffect(() => {
        if (!map.current) return;
        // Switch between light and dark map styles if needed
        // For "Tourm" aesthetic, we might want to stick to a custom light style or 'light-v11'
    }, [theme]);

    return (
        <div className={`relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-border ${className}`}>
            <div ref={mapContainer} className="absolute inset-0" />
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <p className="text-muted-foreground animate-pulse">Loading World Map...</p>
                </div>
            )}
        </div>
    );
}
