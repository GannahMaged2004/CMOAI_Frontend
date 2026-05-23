import { Loader2 } from "lucide-react";
import type { ChannelBreakdown, ContentCalendarMap } from "../../../types/api";

export function CalendarPanels({
  calendarData,
  calendarMessage,
  channelsView,
  busyAction,
  onGenerate14,
  onBalance,
  onFindGaps,
}: {
  calendarData: ContentCalendarMap | null;
  calendarMessage: string | null;
  channelsView: ChannelBreakdown[] | null;
  busyAction: string | null;
  onGenerate14: () => void;
  onBalance: () => void;
  onFindGaps: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Market Calendar</h2>
        <p className="mt-3 text-sm text-white/70">
          Calendar planning is available for this campaign. Generate a real
          content calendar from the backend, balance channels from analytics, or
          run the demo gap review.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="grid gap-2 mt-4">
          <button
            type="button"
            disabled={busyAction === "cal14"}
            onClick={onGenerate14}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60 disabled:opacity-50"
          >
            {busyAction === "cal14" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading...
              </span>
            ) : (
              "Generate next 14 days"
            )}
          </button>
          <button
            type="button"
            disabled={busyAction === "channels"}
            onClick={onBalance}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60 disabled:opacity-50"
          >
            {busyAction === "channels" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading...
              </span>
            ) : (
              "Balance channels"
            )}
          </button>
          <button
            type="button"
            onClick={onFindGaps}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60"
          >
            Find calendar gaps
          </button>
        </div>

        {calendarMessage ? (
          <p className="mt-4 text-sm text-amber-200/90">{calendarMessage}</p>
        ) : null}

        {calendarData ? (
          <div className="mt-4 space-y-3 overflow-y-auto text-sm max-h-72">
            {Object.entries(calendarData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, items]) => (
                <div key={date}>
                  <p className="font-semibold text-neonBlue">{date}</p>
                  <ul className="mt-1 list-disc list-inside text-white/70">
                    {items.map((it) => (
                      <li key={it.id}>
                        {it.title} - {it.platform}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ) : null}

        {channelsView ? (
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium text-white/80">Channel breakdown</p>
            {channelsView.map((row) => (
              <div
                key={row.platform}
                className="rounded border border-white/10 bg-[#0D1018] px-2 py-1.5 text-white/75"
              >
                <span className="font-medium">{row.platform}</span>
                <span className="text-white/50">
                  {" "}
                  - reach {row.total_reach}, clicks {row.total_clicks}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}