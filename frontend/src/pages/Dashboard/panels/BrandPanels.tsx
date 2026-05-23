import type { CampaignOut } from "../../../types/api";
import { nextActions, PANEL_CLASS } from "../constants";
import type { AgentId } from "../types";
import { getAgentDemoIntro } from "../utils";
import { ActionRow } from "../components/ActionRow";
import { BriefStat } from "../components/CampaignBrief";

export function BrandPanels({
  campaign,
  brandAudience,
  onDemoAction,
}: {
  campaign: CampaignOut;
  brandAudience: string | null;
  onDemoAction: (agentId: AgentId, action: string) => void;
}) {
  const audience = brandAudience?.trim() || "the campaign audience";

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className={`${PANEL_CLASS} p-5`}>
        <h2 className="text-2xl font-semibold">Brand Coaching</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          {getAgentDemoIntro("brand", campaign, brandAudience)}
        </p>
        <div className="grid gap-3 mt-4 md:grid-cols-3">
          <BriefStat label="Audience" value={audience} />
          <BriefStat label="Positioning" value="Promise first" />
          <BriefStat label="Voice" value="Clear and proof-led" />
        </div>
      </section>

      <section className={`${PANEL_CLASS} p-5`}>
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="grid gap-2 mt-4">
          {nextActions.brand.map((action) => (
            <ActionRow
              key={action}
              label={action}
              loading={false}
              onClick={() => onDemoAction("brand", action)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}