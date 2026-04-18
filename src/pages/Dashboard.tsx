import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import {
  Sparkles,
  BarChart3,
  Rocket,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {

  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [typing, setTyping] = useState(false);

  const generateStrategy = () => {

    if (!idea) return;

    const text = `🚀 Strategy for "${idea}"

Target Audience:
Young professionals aged 20–35

Platforms:
Instagram, LinkedIn

Content Plan:
• 3 posts per week  
• 2 reels per week  

Campaign Idea:
Create storytelling content showing real-life use cases of ${idea}

CTA:
"Start your journey today with ${idea}"`;

    setOutput("");
    setTyping(true);

    let i = 0;

    const interval = setInterval(() => {
      setOutput((prev) => prev + text[i]);
      i++;

      if (i >= text.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 20);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">

      <Navigation />

      <div className="px-6 py-10 mx-auto space-y-10 max-w-7xl">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back 👋
          </h1>
          <p className="text-white/60">
            Let AI build your marketing strategy
          </p>
        </div>

        {/* GENERATOR */}
        <div className="relative p-8 border shadow-xl rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10">

          <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-3xl" />

          <div className="relative">

            <div className="flex items-center gap-2 mb-6 text-purple-400">
              <Sparkles />
              <h2 className="text-xl font-semibold">
                AI Strategy Generator
              </h2>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">

              <Input
                placeholder="Enter your business idea..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="text-white bg-white/10 border-white/20 placeholder:text-white/50"
              />

              <Button
                onClick={generateStrategy}
                className="transition bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105"
              >
                Generate
              </Button>

            </div>

            {/* OUTPUT */}
            {(output || typing) && (
              <div className="p-6 mt-6 font-mono text-sm whitespace-pre-line border rounded-2xl bg-black/40 border-white/10">

                {output}

                {typing && <span className="animate-pulse">|</span>}

              </div>
            )}

          </div>
        </div>

        {/* ANALYTICS */}
        <div className="grid gap-6 md:grid-cols-3">

          <Card
            title="Engagement"
            value="+24%"
            icon={<TrendingUp />}
            color="text-green-400"
          />

          <Card
            title="Reach"
            value="12.4K"
            icon={<BarChart3 />}
            color="text-blue-400"
          />

          <Card
            title="Campaigns"
            value="8 Active"
            icon={<Rocket />}
            color="text-purple-400"
          />

        </div>

      </div>

    </div>
  );
}


/* CARD */

function Card({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition hover:-translate-y-1">

      <div className={`mb-3 ${color}`}>
        {icon}
      </div>

      <h3 className="text-sm text-white/60">
        {title}
      </h3>

      <p className="text-xl font-bold">
        {value}
      </p>

    </div>
  );
}