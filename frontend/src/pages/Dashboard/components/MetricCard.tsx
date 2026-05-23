import type { LucideIcon } from "lucide-react";
import { PANEL_CLASS } from "../constants";

export function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className={`${PANEL_CLASS} min-w-32 overflow-hidden px-4 py-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white/55">
          <Icon className="size-4" />
          <span className="text-xs uppercase tracking-[0.16em]">{label}</span>
        </div>
        <div className="flex items-end h-8 gap-1 opacity-75">
          <span className="w-1 h-2 rounded-full bg-violet-300/60" />
          <span className="w-1 h-4 rounded-full bg-fuchsia-300/70" />
          <span className="w-1 h-6 rounded-full bg-cyan-300/90" />
          <span className="w-1 h-3 rounded-full bg-violet-200/70" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-white/45">Latest snapshot</p>
    </div>
  );
}