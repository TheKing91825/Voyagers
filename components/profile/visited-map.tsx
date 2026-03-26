"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

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
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);

    // Single effect: initialize map on mount
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token || !mapContainer.current || mapRef.current) return;

        let cancelled = false;

        (async () => {
            try {
                const mapboxgl = (await import("mapbox-gl")).default;
                if (cancelled || !mapContainer.current) return;

                mapboxgl.accessToken = token;

                const map = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: "mapbox://styles/mapbox/standard",
                    projection: "globe" as any,
                    zoom: 1,
                    center: [30, 15],
                    interactive: true,
                });

                mapRef.current = map;

                // Add navigation control (with compass like the reference)
                map.addControl(new mapboxgl.NavigationControl(), "top-right");

                // Disable scroll zoom for cleaner UX (drag still works)
                map.scrollZoom.disable();

                map.on("style.load", () => {
                    if (cancelled) return;
                    setMapLoaded(true);

                    // Default atmosphere — subtle glow like the reference
                    try {
                        map.setFog({} as any);
                    } catch {
                        // Fog API may not be supported
                    }

                    // Add markers for visited locations
                    locations.forEach((loc) => {
                        if (!loc.latitude || !loc.longitude) return;

                        const el = document.createElement("div");
                        el.style.width = "16px";
                        el.style.height = "16px";
                        el.style.backgroundColor = "#EF4444";
                        el.style.borderRadius = "50%";
                        el.style.border = "2.5px solid #fff";
                        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.35)";
                        el.style.cursor = "pointer";
                        el.style.transition = "transform 0.2s ease";
                        el.onmouseenter = () => { el.style.transform = "scale(1.4)"; };
                        el.onmouseleave = () => { el.style.transform = "scale(1)"; };

                        const popup = new mapboxgl.Popup({
                            offset: 25,
                            closeButton: false,
                            maxWidth: "220px",
                        }).setHTML(`
                            <div style="padding: 6px 10px; font-size: 13px; font-weight: 600; color: #1a1a1a;">
                                📍 ${loc.city}, ${loc.country}
                            </div>
                        `);

                        const marker = new mapboxgl.Marker(el)
                            .setLngLat([loc.longitude, loc.latitude])
                            .setPopup(popup)
                            .addTo(map);

                        markersRef.current.push(marker);
                    });
                });

                map.on("error", (e: any) => {
                    console.error("Mapbox error:", e);
                });
            } catch (err) {
                console.error("Failed to load Mapbox:", err);
                if (!cancelled) setMapError(true);
            }
        })();

        return () => {
            cancelled = true;
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty deps — init once

    // If token missing on server render, show placeholder
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        return (
            <div className={`relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-border flex items-center justify-center bg-muted ${className || ""}`}>
                <div className="text-center space-y-2 p-8">
                    <div className="text-4xl">🗺️</div>
                    <p className="text-muted-foreground font-medium">World Map</p>
                    <p className="text-xs text-muted-foreground">Configure NEXT_PUBLIC_MAPBOX_TOKEN to see your travel map</p>
                </div>
            </div>
        );
    }

    if (mapError) {
        return (
            <div className={`relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-border flex items-center justify-center bg-muted ${className || ""}`}>
                <div className="text-center space-y-2 p-8">
                    <div className="text-4xl">⚠️</div>
                    <p className="text-muted-foreground font-medium">Map failed to load</p>
                    <p className="text-xs text-muted-foreground">Please check your Mapbox token</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border ${className || ""}`}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                    <div className="text-center space-y-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground text-sm animate-pulse">Loading World Map...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
