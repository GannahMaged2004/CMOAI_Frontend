import { useState } from "react";
import { BarChart3, Calendar, Sparkles } from "lucide-react";

export default function FeatureDemo({ featureId }: { featureId: string }) {
  const [input, setInput] = useState("");
  const fallbackDemo =
    {
      "brand-coaching": [
        "Positioning: Make the campaign promise clear in one sentence.",
        "Voice: confident, practical, and proof-led.",
        "Next step: turn audience objections into three content angles.",
      ],
      "market-planning": [
        "Audience: prioritize the segment with the highest urgency.",
        "Opportunity: lead with proof before the launch CTA.",
        "Next step: map one objective to each campaign channel.",
      ],
      "campaign-management": [
        "Campaign selected: Spring Launch.",
        "Active agents: Brand, Text, Calendar, Image, Video, Analytics.",
        "Next step: review readiness and approve the first content batch.",
      ],
    }[featureId] ?? [
      "Campaign selected.",
      "Agent demo ready.",
      "Next step: choose a campaign action.",
    ];

  return (
    <div className="relative rounded-3xl border bg-gradient-to-br from-white/80 to-white/50 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-200/30 to-cyan-200/30 blur-2xl" />

      <div className="relative space-y-6">
        {featureId === "content-generation" && (
          <>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles />
              <h3 className="text-lg font-semibold">AI Content Generator</h3>
            </div>

            <input
              placeholder="Write a topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-purple-400"
            />

            <div className="rounded-xl bg-slate-100 p-4 text-sm">
              {input
                ? `AI is generating a post about "${input}"...`
                : "Sample: Turn one campaign idea into a post, email hook, and ad angle."}
            </div>
          </>
        )}

        {featureId === "analytics" && (
          <>
            <div className="flex items-center gap-2 text-blue-600">
              <BarChart3 />
              <h3 className="text-lg font-semibold">Live Analytics</h3>
            </div>

            {[
              { label: "Engagement", value: "24%" },
              { label: "Reach", value: "12.4K" },
              { label: "CTR", value: "3.2%" },
            ].map((item, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-200">
                  <div className="h-2 w-[70%] rounded bg-blue-500" />
                </div>
              </div>
            ))}
          </>
        )}

        {featureId === "smart-calendar" && (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <Calendar />
              <h3 className="text-lg font-semibold">Weekly Plan</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Mon", "Wed", "Fri"].map((day, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200"
                >
                  {day}
                </div>
              ))}
            </div>
          </>
        )}

        {!["content-generation", "analytics", "smart-calendar"].includes(
          featureId
        ) && (
          <div className="space-y-3 text-left">
            {fallbackDemo.map((line) => (
              <div key={line} className="rounded-xl bg-slate-100 p-3 text-sm">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
