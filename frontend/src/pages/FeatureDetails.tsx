import { useParams, useNavigate } from "react-router-dom";
import { features } from "../data/features";
import FeatureDemo from "../components/demo/FeatureDemo";
import { Button } from "../components/ui/button";

import {
  Sparkles,
  Target,
  Rocket,
  Link2,
} from "lucide-react";

export default function FeatureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const feature = features.find((f) => f.id === id);

  if (!feature) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Feature not found
      </div>
    );
  }

  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      {/* HERO */}
      <section className="relative px-6 overflow-hidden text-center py-28">

        <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full top-0 left-1/2 -translate-x-1/2" />

        <div className="relative max-w-3xl mx-auto space-y-6">

          <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-2xl ${feature.bg}`}>
            <Icon className={`w-10 h-10 ${feature.color}`} />
          </div>

          <h1 className="text-5xl font-bold">{feature.title}</h1>

          <p className="text-white/70">{feature.description}</p>

          <Button
            className="transition bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105"
            onClick={() => navigate("/pricing")}
          >
            Get Started
          </Button>

        </div>
      </section>

      {/* WHY */}
      <section className="max-w-3xl px-6 py-16 mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-neonPurple">
          <Sparkles />
          <h2 className="text-2xl font-bold">Why it matters</h2>
        </div>

        <p className="text-white/70">{feature.why}</p>
      </section>

      {/* ACTIONS */}
      <section className="max-w-5xl px-6 py-16 mx-auto">
        <div className="flex items-center justify-center gap-2 mb-10 text-neonBlue">
          <Target />
          <h2 className="text-2xl font-bold">What you can do</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {feature.actions.map((a, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl border bg-white/10 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition hover:-translate-y-1"
            >
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* USE CASE */}
      <section className="px-6 py-20 text-black bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-purple-600">
            <Rocket />
            <h2 className="text-2xl font-bold">How it works in practice</h2>
          </div>

          <p className="text-slate-600">{feature.useCase}</p>
        </div>
      </section>

      {/* CONNECTION */}
      <section className="max-w-3xl px-6 py-16 mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-neonPink">
          <Link2 />
          <h2 className="text-2xl font-bold">
            How it fits into the platform
          </h2>
        </div>

        <p className="text-white/70">{feature.connection}</p>
      </section>

      {/* DEMO */}
      <section className="px-6 py-20 text-black bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-6 text-2xl font-bold">See it in action</h2>

          <FeatureDemo featureId={feature.id} />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center text-white bg-gradient-to-r from-purple-700 to-indigo-900">
        <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>

        <Button
          className="text-black bg-white hover:bg-gray-200"
          onClick={() => navigate("/pricing")}
        >
          View Pricing
        </Button>
      </section>

    </div>
  );
}