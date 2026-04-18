import Navigation from "../components/Navigation";
import PricingHero from "../components/pricing/PricingHero";
import PricingCards from "../components/pricing/PricingCards";
import PricingFAQ from "../components/pricing/PricingFAQ";
import Footer from "../components/Footer";

export default function Pricing() {
  return (
    <div className="bg-white text-cosmic">
      <Navigation />

      <PricingHero />
      <PricingCards />
      <PricingFAQ />
      <Footer />
    </div>
  );
}
