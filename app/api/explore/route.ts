/* ──────────────────────────────────────────────
 * POST /api/explore
 * AI-powered destination activity generator using Gemini
 * Generates activities based on user preferences and destination
 * ────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { createServerClient } from "@/lib/supabase/server";

export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();
        const { destination, count = 5 } = body;

        if (!destination) {
            return NextResponse.json({ error: "Destination is required" }, { status: 400 });
        }

        const supabase = createServerClient();

        // Get user preferences for personalized recommendations
        const { data: supaUser } = await supabase
            .from("users")
            .select("id, user_preferences(*)")
            .eq("firebase_uid", user.uid)
            .single();

        const prefs = supaUser?.user_preferences?.[0] || null;

        // Build the Gemini prompt
        const prompt = buildExplorePrompt(destination, prefs, count);

        // Call Gemini API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Return mock data if Gemini key is not configured
            return NextResponse.json({
                activities: getMockActivities(destination, count),
                source: "mock",
            });
        }

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json",
                    },
                }),
            }
        );

        if (!geminiResponse.ok) {
            console.error("Gemini API error:", await geminiResponse.text());
            return NextResponse.json({
                activities: getMockActivities(destination, count),
                source: "mock",
                reason: "Gemini API unavailable",
            });
        }

        const geminiData = await geminiResponse.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return NextResponse.json({
                activities: getMockActivities(destination, count),
                source: "mock",
                reason: "Empty Gemini response",
            });
        }

        try {
            const activities = JSON.parse(text);
            return NextResponse.json({ activities, source: "gemini" });
        } catch {
            console.error("Failed to parse Gemini response:", text);
            return NextResponse.json({
                activities: getMockActivities(destination, count),
                source: "mock",
                reason: "Parse error",
            });
        }
    } catch (error) {
        console.error("Explore POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});

function buildExplorePrompt(
    destination: string,
    prefs: Record<string, unknown> | null,
    count: number
): string {
    let prefContext = "";
    if (prefs) {
        prefContext = `
The traveler has these preferences:
- Budget: ${prefs.budget || "moderate"}
- Travel style: ${prefs.travel_style || "balanced"}
- Travel pace: ${prefs.travel_pace || "moderate"}
- Group size: ${prefs.group_size || "solo"}
- Interests: ${(prefs.interests as string[])?.join(", ") || "general sightseeing"}
- Accommodation preference: ${prefs.accommodation || "hotel"}
- Dietary preferences: ${(prefs.dietary_preferences as string[])?.join(", ") || "none"}
`;
    }

    return `You are a travel activity recommendation engine. Generate exactly ${count} unique, specific activities for a traveler visiting ${destination}.
${prefContext}
Return a JSON array of objects with these exact fields:
- "name": activity name (string)
- "description": 2-3 sentence description (string)
- "duration": estimated duration like "2 hours" or "Half day" (string)
- "estimated_cost": cost range like "$20-40" or "Free" (string)
- "best_time": best time to do this like "Morning" or "Evening" (string)
- "category": one of "sightseeing", "food", "adventure", "culture", "nature", "nightlife", "shopping", "relaxation" (string)

Make the activities diverse across categories. Be specific to ${destination} — include real place names, local specialties, and insider tips.`;
}

function getMockActivities(destination: string, count: number) {
    const templates = [
        {
            name: `Walking tour of ${destination}'s historic center`,
            description: `Explore the charming streets and hidden gems of ${destination}'s old town. Discover historic architecture, local markets, and vibrant street art along the way.`,
            duration: "3 hours",
            estimated_cost: "$15-30",
            best_time: "Morning",
            category: "sightseeing",
        },
        {
            name: `Local food tasting in ${destination}`,
            description: `Sample the best local cuisine ${destination} has to offer. From street food stalls to family-run restaurants, this culinary adventure covers all the must-try dishes.`,
            duration: "2 hours",
            estimated_cost: "$25-50",
            best_time: "Afternoon",
            category: "food",
        },
        {
            name: `Sunset viewpoint in ${destination}`,
            description: `Head to the most scenic viewpoint in ${destination} for a breathtaking sunset. Bring a camera and enjoy the golden hour light over the cityscape.`,
            duration: "1.5 hours",
            estimated_cost: "Free",
            best_time: "Evening",
            category: "nature",
        },
        {
            name: `${destination} cultural museum visit`,
            description: `Immerse yourself in the rich history and culture of ${destination} at its premier museum. Interactive exhibits and guided tours bring the city's story to life.`,
            duration: "2 hours",
            estimated_cost: "$10-20",
            best_time: "Morning",
            category: "culture",
        },
        {
            name: `Nightlife experience in ${destination}`,
            description: `Discover ${destination}'s vibrant nightlife scene from rooftop bars to live music venues. Mingle with locals and experience the city after dark.`,
            duration: "3 hours",
            estimated_cost: "$30-60",
            best_time: "Night",
            category: "nightlife",
        },
        {
            name: `Adventure activity near ${destination}`,
            description: `Get your adrenaline pumping with an outdoor adventure near ${destination}. Whether it's hiking, kayaking, or zip-lining, there's something for every thrill-seeker.`,
            duration: "Half day",
            estimated_cost: "$40-80",
            best_time: "Morning",
            category: "adventure",
        },
    ];

    return templates.slice(0, Math.min(count, templates.length));
}
