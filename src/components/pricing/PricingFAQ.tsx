import Section from "../Section";
import {
  CircleDollarSign,
  CreditCard,
  ArrowLeftRight
} from "lucide-react";

export default function PricingFAQ() {

  const faqs = [
    {
      q: "Can I start for free?",
      a: "Yes, the free plan lets you explore core features.",
      icon: CircleDollarSign,
      color: "text-neonGreen",
      bg: "bg-neonGreen/10",
      shadow: "hover:shadow-[0_0_25px_rgba(0,255,0,0.4)]"
    },
    {
      q: "Can I upgrade anytime?",
      a: "You can upgrade or cancel your plan at any time.",
      icon: CreditCard,
      color: "text-neonBlue",
      bg: "bg-neonBlue/10",
      shadow: "hover:shadow-[0_0_25px_rgba(59,224,255,0.4)]"
    },
    {
      q: "Do you offer refunds?",
      a: "We offer refunds within 7 days of purchase.",
      icon: ArrowLeftRight,
      color: "text-neonPink",
      bg: "bg-neonPink/10",
      shadow: "hover:shadow-[0_0_25px_rgba(254,1,154,0.4)]"
    },
  ];

  return (
    <Section className="p-10 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-8">

        <h2 className="text-3xl font-bold text-center">
          Frequently asked questions
        </h2>

        {faqs.map((faq, i) => {
          const Icon = faq.icon;

          return (
            <div
              key={i}
              className={`group flex gap-4 items-start p-6 bg-white border rounded-xl transition-all duration-300 hover:-translate-y-1 ${faq.shadow}`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${faq.bg}`}>
                <Icon className={`w-6 h-6 ${faq.color}`} />
              </div>

              <div>
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {faq.a}
                </p>
              </div>

            </div>
          );
        })}

      </div>
    </Section>
  );
}