import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { AnalyticsOverview, ChannelBreakdown } from "../../../types/api";
import { getAnalyticsChannels, getAnalyticsOverview } from "../../../services/analyticsService";
import { nextActions } from "../constants";
import { SuggestionList } from "../components/SuggestionList";
import type { Agent, AgentId, AgentSuggestion } from "../types";

export function AnalyticsRightAside({
  activeAgent,
  campaignName,
  suggestions,
  onDemoAction,
}: {
  activeAgent: Agent;
  campaignName: string;
  suggestions: AgentSuggestion[];
  onDemoAction: (agentId: AgentId, action: string) => void;
}) {
  const Icon = activeAgent.icon;
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [channels, setChannels] = useState<ChannelBreakdown[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getAnalyticsOverview(), getAnalyticsChannels()])
      .then(([o, ch]) => {
        if (!cancelled) {
          setOverview(o);
          setChannels(ch);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
      <div className="flex h-full min-h-[560px] flex-col">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-md size-10 bg-white/10">
              <Icon className={`size-5 ${activeAgent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {activeAgent.name}
              </p>
              <p className="text-xs truncate text-white/45">{campaignName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto text-sm text-white/80">
          {loading ? (
            <p className="flex items-center gap-2 text-white/60">
              <Loader2 className="size-4 animate-spin" /> Loading...
            </p>
          ) : err ? (
            <p className="text-red-300">{err}</p>
          ) : overview ? (
            <>
              <SuggestionList
                suggestions={suggestions}
                onSelect={(action) => onDemoAction("analytics", action)}
              />
              <div className="rounded-md bg-white/[0.07] px-3 py-2">
                <p className="text-xs text-white/45">Overview</p>
                <p>Reach: {overview.total_reach}</p>
                <p>Engagement: {overview.avg_engagement_rate}%</p>
                <p>Clicks: {overview.total_clicks}</p>
                <p>Conversions: {overview.total_conversions}</p>
              </div>
              {channels?.length ? (
                <div className="rounded-md bg-white/[0.07] px-3 py-2">
                  <p className="text-xs text-white/45">Channels</p>
                  <ul className="mt-1 space-y-1">
                    {channels.map((c) => (
                      <li key={c.platform}>
                        {c.platform}: {c.total_clicks} clicks
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="grid gap-2 mb-3">
            {nextActions.analytics.slice(1).map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => onDemoAction("analytics", action)}
                className="px-3 py-2 text-xs text-left transition border rounded-md border-white/10 text-white/70 hover:border-neonBlue/60 hover:text-white"
              >
                {action}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const action = draft.trim() || "Find weak funnel step";
              onDemoAction("analytics", action);
              setDraft("");
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Analytics"
              className="bg-white h-11 border-white/10 text-cosmic placeholder:text-slate-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!draft.trim()}
              className="text-white h-11 w-11 bg-neonPink hover:bg-neonPink/90"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
