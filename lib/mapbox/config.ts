/**
 * Mapbox configuration.
 * The token is public (needed client-side for map rendering).
 */
export const MAPBOX_TOKEN: string =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** Default map center coordinates (roughly center of the world) */
export const DEFAULT_MAP_CENTER = {
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
} as const;
