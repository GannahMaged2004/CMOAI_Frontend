import type { CampaignOut } from "../../../types/api";
import { PANEL_CLASS, SUBPANEL_CLASS } from "../constants";
import { formatLaunchDate, mapCampaignStatusToStage } from "../utils";

export function CampaignBrief({ campaign }: { campaign: CampaignOut }) {
  const stage = mapCampaignStatusToStage(campaign.status);
  const launch = formatLaunchDate(campaign.start_date);

  return (
    <section className={`mb-5 p-5 ${PANEL_CLASS}`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="min-w-0">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">
            Campaign brief
          </p>
          <h1 className="text-2xl font-semibold leading-tight break-words md:text-3xl">
            {campaign.name}
          </h1>
          <p className="max-w-3xl mt-2 text-sm leading-6 text-white/60">
            {campaign.description?.trim() || "No description provided."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
          <BriefStat label="Stage" value={stage} />
          <BriefStat label="Launch" value={launch} />
        </div>
      </div>
    </section>
  );
}

export function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${SUBPANEL_CLASS} px-3 py-2`}>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-medium truncate">{value}</p>
    </div>
  );
}