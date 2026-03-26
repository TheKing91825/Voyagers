"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
    const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const userInteractingRef = useRef(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);

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
                    zoom: 1.5,
                    center: [20, 30],
                    pitch: 0,
                    bearing: 0,
                    interactive: true,
                });

                mapRef.current = map;

                // Navigation controls
                map.addControl(new mapboxgl.NavigationControl(), "top-right");
                map.scrollZoom.enable();

                // Atmosphere / fog
                map.on("style.load", () => {
                    if (cancelled) return;
                    map.setFog({
                        'color': 'rgb(186, 210, 235)',
                        'high-color': 'rgb(36, 92, 223)',
                        'horizon-blend': 0.02,
                        'space-color': 'rgb(11, 11, 25)',
                        'star-intensity': 0.6,
                    } as any);
                });

                map.on("load", async () => {
                    if (cancelled) return;
                    setMapLoaded(true);

                    // ── Geocode & add markers ──
                    await addLocationMarkers(map, mapboxgl, token, locations, markersRef);

                    // ── Rotating globe ──
                    const spinGlobe = () => {
                        if (!userInteractingRef.current && mapRef.current) {
                            mapRef.current.easeTo({
                                center: [mapRef.current.getCenter().lng + 0.4, mapRef.current.getCenter().lat],
                                duration: 1000,
                                easing: (n: number) => n,
                            });
                        }
                    };

                    // Pause rotation on interaction
                    map.on("mousedown", () => { userInteractingRef.current = true; });
                    map.on("touchstart", () => { userInteractingRef.current = true; });
                    map.on("mouseup", () => { userInteractingRef.current = false; });
                    map.on("dragend", () => { userInteractingRef.current = false; });
                    map.on("pitchend", () => { userInteractingRef.current = false; });
                    map.on("rotateend", () => { userInteractingRef.current = false; });
                    map.on("touchend", () => { userInteractingRef.current = false; });

                    // Resume rotation after 3s of no interaction
                    const resumeAfterDelay = () => {
                        setTimeout(() => {
                            userInteractingRef.current = false;
                        }, 3000);
                    };
                    map.on("moveend", resumeAfterDelay);

                    // Start spinning
                    spinIntervalRef.current = setInterval(spinGlobe, 1000);
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
            if (spinIntervalRef.current) {
                clearInterval(spinIntervalRef.current);
                spinIntervalRef.current = null;
            }
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Placeholder: no token
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

/* ─── Geocode locations & add markers ─── */
async function addLocationMarkers(
    map: any,
    mapboxgl: any,
    token: string,
    locations: VisitedLocation[],
    markersRef: React.MutableRefObject<any[]>
) {
    const resolved: { coordinates: [number, number]; location: VisitedLocation }[] = [];

    for (const loc of locations) {
        let lng = loc.longitude;
        let lat = loc.latitude;

        // If coords are missing/zero, geocode via Mapbox
        if (!lat || !lng || (lat === 0 && lng === 0)) {
            try {
                const query = `${loc.city}, ${loc.country}`;
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
                );
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                    [lng, lat] = data.features[0].center;
                } else {
                    continue; // skip if geocode fails
                }
            } catch {
                continue;
            }
        }

        // Create marker element — smaller pin style to match user's old code
        const markerEl = document.createElement("div");
        markerEl.className = "custom-marker group";
        
        // Wrap the SVG in an inner div to handle hover scaling without disrupting Mapbox's translate transforms
        markerEl.innerHTML = `
            <div class="transition-transform duration-200 ease-in-out group-hover:scale-125 group-hover:-translate-y-1">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#ff6b6b"/>
                    <circle cx="12" cy="11" r="4.5" fill="white"/>
                </svg>
            </div>
        `;
        markerEl.style.cursor = "pointer";

        // Popup
        const popup = new mapboxgl.Popup({
            offset: 30,
            closeButton: false,
            maxWidth: "240px",
        }).setHTML(`
            <div style="padding: 8px 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                📍 ${loc.city}, ${loc.country}
            </div>
        `);

        // Click to fly to location
        markerEl.addEventListener("click", () => {
            map.flyTo({
                center: [lng, lat],
                zoom: 8,
                pitch: 45,
                duration: 2000,
            });
        });

        const marker = new mapboxgl.Marker({ element: markerEl, anchor: "bottom" })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);

        markersRef.current.push(marker);
        resolved.push({ coordinates: [lng, lat], location: loc });
    }

    // Fit bounds to show all markers after a short delay
    if (resolved.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        resolved.forEach((r) => bounds.extend(r.coordinates));
        setTimeout(() => {
            map.fitBounds(bounds, {
                padding: 80,
                maxZoom: 8,
                duration: 2000,
            });
        }, 1500);
    } else if (resolved.length === 1) {
        setTimeout(() => {
            map.flyTo({
                center: resolved[0].coordinates,
                zoom: 4,
                duration: 2000,
            });
        }, 1500);
    }
}
