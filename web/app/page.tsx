import { ConditionalHeader } from "@/components/navigation/conditionalHeader";
import { HeroSection } from "@/components/hero-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b]">
      <ConditionalHeader />
      <HeroSection />
    </main>
  );
}
