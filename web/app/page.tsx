import { ConditionalHeader } from "@/components/navigation/conditionalHeader";
import { HeroSection } from "@/components/hero-section";
import { ImageComponent } from "@/components/home/imageComponent";
import AboutSection from "@/components/aboutSection";
import AiNativeSection from "@/components/aiNativeSection";
import AgentBentoGrid from "@/components/ui/agent-bento-grid";
import CoreFeaturesSection from "@/components/coreFeaturesSection";
import ExploreSection from "@/components/exploreSection";
import RichCardsSection from "@/components/richCardsSection";
import PrivacySection from "@/components/privacySection";
import HowItWorksSection from "@/components/howItWorksSection";
import PlatformSection from "@/components/platformSection";
import FutureSection from "@/components/futureSection";
import FAQSection from "@/components/faqSection";
import CTASection from "@/components/ctaSection";
import Footer from "@/components/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black py-3">
      {/* ── Navigation ── */}
      <ConditionalHeader />

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── What is Vyra? (About) ── */}
      <AboutSection />

      {/* ── Core Features ── */}
      <CoreFeaturesSection />

      {/* ── AI Native ── */}
      <AiNativeSection />

      {/* ── Explore ── */}
      <ExploreSection />

      {/* ── Rich Cards (parallax image gallery) ── */}
      <ImageComponent />

      {/* ── Rich Cards (bento features) ── */}
      <AgentBentoGrid />

      {/* ── Rich Media Cards ── */}
      <RichCardsSection />

      {/* ── Privacy ── */}
      <PrivacySection />

      {/* ── How It Works ── */}
      <HowItWorksSection />

      {/* ── Platform ── */}
      <PlatformSection />

      {/* ── Future / Roadmap ── */}
      <FutureSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <CTASection />

      {/* ── Footer ── */}
      <Footer />
    </main>
  );
}
