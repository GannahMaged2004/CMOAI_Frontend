import { useState } from "react";
import {
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function FeatureDemo({ featureId }: { featureId: string }) {
  const [input, setInput] = useState("");

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-xl border shadow-[0_10px_40px_rgba(0,0,0,0.15)]">

      <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-cyan-200/30 blur-2xl rounded-3xl" />

      <div className="relative space-y-6">

        {/* CONTENT GENERATION */}
        {featureId === "content-generation" && (
          <>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles />
              <h3 className="text-lg font-semibold">
                AI Content Generator
              </h3>
            </div>

            <input
              placeholder="Write a topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 border outline-none rounded-xl focus:ring-2 focus:ring-purple-400"
            />

            <div className="p-4 text-sm rounded-xl bg-slate-100">
              {input
                ? `✨ AI is generating a post about "${input}"...`
                : "Your generated content will appear here"}
            </div>
          </>
        )}

        {/* ANALYTICS */}
        {featureId === "analytics" && (
          <>
            <div className="flex items-center gap-2 text-blue-600">
              <BarChart3 />
              <h3 className="text-lg font-semibold">
                Live Analytics
              </h3>
            </div>

            {[
              { label: "Engagement", value: "24%" },
              { label: "Reach", value: "12.4K" },
              { label: "CTR", value: "3.2%" }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1 text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full h-2 rounded bg-slate-200">
                  <div className="h-2 rounded bg-blue-500 w-[70%]" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* CALENDAR */}
        {featureId === "smart-calendar" && (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <Calendar />
              <h3 className="text-lg font-semibold">
                Weekly Plan
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Mon", "Wed", "Fri"].map((day, i) => (
                <div
                  key={i}
                  className="p-3 transition rounded-xl bg-slate-100 hover:bg-slate-200"
                >
                  {day}
                </div>
              ))}
            </div>
          </>
        )}

        {/* DEFAULT */}
        {!["content-generation", "analytics", "smart-calendar"].includes(featureId) && (
          <p className="text-sm text-slate-500">
            Interactive preview coming soon
          </p>
        )}

      </div>
    </div>
  );
}