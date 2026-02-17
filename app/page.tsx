import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: "✨",
    title: "AI-Powered Recommendations",
    description:
      "Get personalized destination and activity suggestions based on your travel style, budget, and interests.",
  },
  {
    icon: "🗺️",
    title: "Trip Planning & Collaboration",
    description:
      "Build day-by-day itineraries and invite friends to plan together in real time.",
  },
  {
    icon: "💬",
    title: "Social Reviews & Connections",
    description:
      "Share travel reviews with photos, connect with fellow travelers, and discover new places through your network.",
  },
  {
    icon: "🌍",
    title: "Interactive Maps",
    description:
      "Visualize your trips and visited locations on beautiful, interactive world maps.",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 md:py-36 text-center bg-gradient-to-b from-background to-muted">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Plan your next adventure with{" "}
          <span className="text-primary">Voyager</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
          AI-powered travel planning that adapts to your style. Discover
          destinations, build itineraries, and share experiences — all in one
          place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">Explore Destinations</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Everything you need to travel smarter
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-md">
              <CardContent className="pt-6 text-center space-y-3">
                <span className="text-4xl">{feature.icon}</span>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to start planning?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join Voyager today and turn your travel dreams into detailed,
          actionable plans.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Create Free Account</Link>
        </Button>
      </section>
    </main>
  );
}
