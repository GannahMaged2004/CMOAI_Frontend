import { ChevronRight, Megaphone } from "lucide-react";
import type { CampaignOut } from "../../../types/api";
import { agents, nextActions, PANEL_CLASS, SUBPANEL_CLASS } from "../constants";
import type { AgentId } from "../types";
import { formatLaunchDate, getAgentDemoIntro } from "../utils";

export function OrchestratorPanel({
  campaign,
  brandAudience,
  onPickAgent,
  onDemoAction,
}: {
  campaign: CampaignOut;
  brandAudience: string | null;
  onPickAgent: (agentId: AgentId) => void;
  onDemoAction: (agentId: AgentId, action: string) => void;
}) {
  const launch = formatLaunchDate(campaign.start_date);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${PANEL_CLASS} p-5 lg:col-span-2`}>
          <div className="flex items-center gap-2 text-neonBlue">
            <Megaphone className="size-5" />
            <h2 className="text-lg font-semibold">Orchestrator Queue</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/70">
            {getAgentDemoIntro("orchestrator", campaign, brandAudience)}
          </p>
          <div className="grid gap-2 mt-4 md:grid-cols-3">
            {nextActions.orchestrator.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => onDemoAction("orchestrator", action)}
                className={`${SUBPANEL_CLASS} px-3 py-2 text-left text-xs text-white/85 transition hover:border-neonBlue/60 hover:text-white`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className={`${PANEL_CLASS} p-5`}>
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Audience
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {brandAudience?.trim() ||
              "Audience details will load from the linked brand."}
          </p>
          <div className={`mt-4 ${SUBPANEL_CLASS} px-3 py-2 text-sm`}>
            <p className="text-white/45">Launch</p>
            <p className="mt-1 font-medium text-white/80">{launch}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {agents
          .filter((agent) => agent.id !== "orchestrator")
          .map((agent) => {
            const Icon = agent.icon;

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => onPickAgent(agent.id)}
                className={`${PANEL_CLASS} p-4 text-left transition hover:border-neonBlue/60 hover:bg-white/[0.07]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center min-w-0 gap-3">
                    <Icon className={`size-5 shrink-0 ${agent.accent}`} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{agent.name}</p>
                      <p className="mt-1 text-xs truncate text-white/45">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-white/35" />
                </div>
                <p className="mt-4 text-xs font-medium text-white/55">
                  Ready for campaign demo
                </p>
              </button>
            );
          })}
      </section>
    </div>
  );
}
