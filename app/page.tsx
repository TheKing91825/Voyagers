import { HeroSlider } from "@/components/home/hero-slider";
import { PopularDestinations } from "@/components/home/popular-destinations";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSlider />
      <PopularDestinations />
    </main>
  );
}
