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
                    style: "mapbox://styles/mapbox/dark-v11",
                    center: [20, 20],
                    zoom: 1.5,
                    projection: "globe" as any,
                    interactive: true,
                    attributionControl: false,
                });

                mapRef.current = map;

                map.on("load", () => {
                    if (cancelled) return;
                    setMapLoaded(true);

                    try {
                        map.setFog({
                            range: [1.0, 8.0],
                            color: "#1a1a2e",
                            "horizon-blend": 0.1,
                        } as any);
                    } catch {
                        // Fog API may not be supported in all versions
                    }

                    // Add markers
                    locations.forEach((loc) => {
                        if (!loc.latitude || !loc.longitude) return;

                        const el = document.createElement("div");
                        el.style.width = "14px";
                        el.style.height = "14px";
                        el.style.backgroundColor = "#D4AF37";
                        el.style.borderRadius = "50%";
                        el.style.border = "2px solid rgba(255,255,255,0.8)";
                        el.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.3), 0 2px 8px rgba(0,0,0,0.3)";
                        el.style.cursor = "pointer";
                        el.style.transition = "transform 0.2s";
                        el.onmouseenter = () => { el.style.transform = "scale(1.5)"; };
                        el.onmouseleave = () => { el.style.transform = "scale(1)"; };

                        const popup = new mapboxgl.Popup({
                            offset: 25,
                            closeButton: false,
                        }).setHTML(`
                            <div style="padding: 4px 8px; font-size: 13px; font-weight: 600;">
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

                map.addControl(
                    new mapboxgl.NavigationControl({ showCompass: false }),
                    "top-right"
                );
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
