// src/components/PricingCards.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for exploring CMO.AI",
    features: [
      "Basic strategy generation",
      "Limited content outputs",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19/mo",
    highlight: true,
    description: "For serious founders and marketers",
    features: [
      "Unlimited strategies",
      "Advanced analytics",
      "Content generation",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For teams and businesses",
    features: [
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
    ],
  },
];

export default function PricingCards() {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-24 bg-white">
      <div className="grid max-w-6xl gap-10 mx-auto md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 border rounded-2xl transition hover:scale-105 ${
              plan.highlight ? "border-neonPurple scale-105 shadow-xl" : ""
            }`}
          >
            {plan.highlight && (
              <span className="absolute px-3 py-1 text-xs text-white -translate-x-1/2 rounded-full -top-3 left-1/2 bg-neonPurple">
                Most Popular
              </span>
            )}

            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <div className="my-4 text-3xl font-bold">{plan.price}</div>
            <p className="mb-6 text-slate-600">{plan.description}</p>

            <ul className="mb-6 space-y-2 text-sm">
              {plan.features.map((f, idx) => (
                <li key={idx}>• {f}</li>
              ))}
            </ul>

            <Button
              className="w-full hover:bg-neonPurple hover:text-white"
              onClick={() =>
                navigate(`/payment?plan=${plan.id}`)
              }
            >
              {plan.name === "Free" ? "Start Free" : "Get Started"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}