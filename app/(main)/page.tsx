import { HeroSection } from "@/components/hero-section"
import { AnimatedFeaturesSection } from "@/components/animated-features-section"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { AnimatedCTASection } from "@/components/animated-cta-section"

export default function HomePage() {
  return (
    <main className="pt-20">
      <HeroSection />
      <AnimatedFeaturesSection />
      <PricingSection />
      <FAQSection />
      <AnimatedCTASection />
    </main>
  )
}
