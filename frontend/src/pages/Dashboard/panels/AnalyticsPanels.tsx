import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AnalyticsOverview, ChannelBreakdown } from "../../../types/api";
import { getAnalyticsChannels, getAnalyticsOverview } from "../../../services/analyticsService";
import { ActionRow } from "../components/ActionRow";

export function AnalyticsPanels({
  busyAction,
  onSummarize,
  onWeakFunnel,
  onBudgetShift,
}: {
  busyAction: string | null;
  onSummarize: () => void;
  onWeakFunnel: () => void;
  onBudgetShift: () => void;
}) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [channels, setChannels] = useState<ChannelBreakdown[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (!cancelled) {
          setLoadErr(e instanceof Error ? e.message : "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLine =
    overview == null
      ? "-"
      : overview.total_impressions === 0
        ? "Awaiting data"
        : "Data available";

  const activityLabel =
    overview == null
      ? "-"
      : overview.total_clicks > 0
        ? "Active"
        : "Awaiting data";

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Performance Analytics</h2>
        <p className="mt-1 text-sm text-white/50">
          Signals from GET /analytics/overview and /analytics/channels
        </p>

        {loading ? (
          <p className="flex items-center gap-2 mt-4 text-sm text-white/60">
            <Loader2 className="size-4 animate-spin" /> Loading analytics...
          </p>
        ) : loadErr ? (
          <p className="mt-4 text-sm text-red-300">{loadErr}</p>
        ) : overview ? (
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <p>
              <span className="text-white/50">Activity: </span>
              {activityLabel}
            </p>
            <p>
              <span className="text-white/50">Total reach: </span>
              {overview.total_reach}
            </p>
            <p>
              <span className="text-white/50">Impressions: </span>
              {overview.total_impressions}
            </p>
            <p>
              <span className="text-white/50">Engagement rate: </span>
              {overview.avg_engagement_rate}%
            </p>
            <p>
              <span className="text-white/50">Clicks: </span>
              {overview.total_clicks}
            </p>
            <p>
              <span className="text-white/50">Conversions: </span>
              {overview.total_conversions}
            </p>
            {channels?.length ? (
              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                  By channel
                </p>
                <ul className="mt-2 space-y-1">
                  {channels.map((c) => (
                    <li key={c.platform}>
                      {c.platform}: reach {c.total_reach}, clicks{" "}
                      {c.total_clicks}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <p className="mt-2 text-lg font-semibold">{statusLine}</p>
        <div className="grid gap-2 mt-4">
          <ActionRow
            label="Summarize performance"
            loading={busyAction === "asum"}
            onClick={onSummarize}
          />
          <button
            type="button"
            onClick={onWeakFunnel}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60"
          >
            Find weak funnel step
          </button>
          <button
            type="button"
            onClick={onBudgetShift}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60"
          >
            Suggest budget shift
          </button>
        </div>
      </section>
    </div>
  );
}