// src/components/landing/FeatureSection.tsx
import Section from "../Section";
import { features } from "../../data/features";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export default function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <Section id="features" className="pb-10 bg-white">
      <div className="pb-10 mb-16 space-y-4 text-center">
        <h2 className="pt-10 text-3xl font-bold sm:text-4xl">
          Everything you need to{" "}
          <span className="text-neonPurple animate-shrink-expand">grow</span>
        </h2>

        <p className="text-slate-600">
          Replace scattered marketing tools with one intelligent platform.
        </p>
      </div>

      <div className="grid max-w-6xl gap-10 mx-auto sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.id}
              className={`group relative p-8 bg-white border rounded-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] ${feature.shadow}`}
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-80 transition duration-500 blur-2xl rounded-2xl ${feature.bg}`}
              />

              <div className="relative">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 ${feature.bg}`}
                >
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>

                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>

                <p className="mb-6 text-sm text-slate-600">
                  {feature.description}
                </p>

                <Button
                  onClick={() => navigate(`/features/${feature.id}`)}
                  variant="outline"
                >
                  Learn More
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
