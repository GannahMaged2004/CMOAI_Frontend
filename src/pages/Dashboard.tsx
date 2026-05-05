import { useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Image,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  PenLine,
  Plus,
  Send,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type Campaign = {
  id: string;
  name: string;
  stage: string;
  audience: string;
  goal: string;
  launchDate: string;
};

type AgentId =
  | "orchestrator"
  | "brand"
  | "calendar"
  | "text"
  | "image"
  | "video"
  | "analytics";

type Agent = {
  id: AgentId;
  name: string;
  shortName: string;
  description: string;
  progress: number;
  status: string;
  icon: typeof Bot;
  accent: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const campaigns: Campaign[] = [
  {
    id: "launch",
    name: "Spring SaaS Launch",
    stage: "Launch planning",
    audience: "Growth teams and startup founders",
    goal: "Convert trial users into paid teams",
    launchDate: "May 18",
  },
  {
    id: "retention",
    name: "Retention Winback",
    stage: "Optimization",
    audience: "Dormant monthly subscribers",
    goal: "Recover inactive accounts with sharper lifecycle messaging",
    launchDate: "June 03",
  },
  {
    id: "creator",
    name: "Creator Partnership Push",
    stage: "Creative production",
    audience: "Micro-creators and agency partners",
    goal: "Build trust through partner-led proof",
    launchDate: "June 21",
  },
];

const agents: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    shortName: "Dashboard",
    description: "Campaign command center",
    progress: 72,
    status: "4 agents active",
    icon: LayoutDashboard,
    accent: "text-neonBlue",
  },
  {
    id: "brand",
    name: "Brand Coaching",
    shortName: "Brand",
    description: "Positioning, voice, audience fit",
    progress: 86,
    status: "Voice guide ready",
    icon: Sparkles,
    accent: "text-neonPurple",
  },
  {
    id: "calendar",
    name: "Market Calendar",
    shortName: "Calendar",
    description: "Campaign timing and content cadence",
    progress: 64,
    status: "2 weeks drafted",
    icon: CalendarDays,
    accent: "text-neonBlue",
  },
  {
    id: "text",
    name: "Text Generation",
    shortName: "Text",
    description: "Posts, ads, emails, landing copy",
    progress: 58,
    status: "12 drafts queued",
    icon: PenLine,
    accent: "text-neonPink",
  },
  {
    id: "image",
    name: "Image Generation",
    shortName: "Image",
    description: "Visual briefs and campaign assets",
    progress: 42,
    status: "3 briefs pending",
    icon: Image,
    accent: "text-neonYellow",
  },
  {
    id: "video",
    name: "Video Generation",
    shortName: "Video",
    description: "Scripts, storyboards, shorts",
    progress: 36,
    status: "Storyboard started",
    icon: Clapperboard,
    accent: "text-neonGreen",
  },
  {
    id: "analytics",
    name: "Performance Analytics",
    shortName: "Analytics",
    description: "Signals, learnings, next moves",
    progress: 51,
    status: "Awaiting spend data",
    icon: BarChart3,
    accent: "text-neonBlue",
  },
];

const agentHistory: Record<AgentId, string[]> = {
  orchestrator: [
    "Pulled latest campaign state from all agents.",
    "Prioritized brand voice, calendar gaps, and paid-social copy.",
    "Prepared next-step plan for the selected campaign.",
  ],
  brand: [
    "Defined primary customer tension and emotional promise.",
    "Drafted voice traits: precise, ambitious, practical.",
    "Flagged unclear proof points for founder review.",
  ],
  calendar: [
    "Mapped launch week channels.",
    "Reserved education posts before conversion posts.",
    "Queued reminder windows for email and LinkedIn.",
  ],
  text: [
    "Drafted LinkedIn launch announcement.",
    "Created three ad hook directions.",
    "Saved email subject line options for review.",
  ],
  image: [
    "Built visual direction around product clarity.",
    "Queued testimonial graphic prompt.",
    "Marked dashboard screenshots as needed assets.",
  ],
  video: [
    "Outlined 30-second founder intro.",
    "Prepared three short-form hook ideas.",
    "Waiting on product screen recordings.",
  ],
  analytics: [
    "Created baseline KPI set.",
    "Flagged missing traffic source mapping.",
    "Prepared first reporting view.",
  ],
};

const nextActions: Record<AgentId, string[]> = {
  orchestrator: [
    "Create a 7-day launch plan",
    "Ask every agent for blockers",
    "Summarize campaign readiness",
  ],
  brand: [
    "Refine positioning",
    "Create a voice guide",
    "Write audience objections",
  ],
  calendar: [
    "Generate next 14 days",
    "Balance channels",
    "Find calendar gaps",
  ],
  text: [
    "Write LinkedIn posts",
    "Draft email sequence",
    "Create ad hooks",
  ],
  image: [
    "Create image prompts",
    "Draft asset briefs",
    "Review visual consistency",
  ],
  video: [
    "Write short video script",
    "Create storyboard",
    "Plan creator brief",
  ],
  analytics: [
    "Summarize performance",
    "Find weak funnel step",
    "Suggest budget shift",
  ],
};

const initialChat: Record<AgentId, ChatMessage[]> = {
  orchestrator: [
    {
      role: "assistant",
      text: "I have the whole campaign context. Tell me the outcome you want and I will route the work across the agents.",
    },
  ],
  brand: [
    {
      role: "assistant",
      text: "I can sharpen positioning, voice, audience objections, or the campaign promise.",
    },
  ],
  calendar: [
    {
      role: "assistant",
      text: "I can turn the campaign goal into a calendar with channels, dates, and content intent.",
    },
  ],
  text: [
    {
      role: "assistant",
      text: "I can write campaign copy, compare angles, or expand the approved strategy into drafts.",
    },
  ],
  image: [
    {
      role: "assistant",
      text: "I can turn the campaign direction into image prompts, asset briefs, and visual variations.",
    },
  ],
  video: [
    {
      role: "assistant",
      text: "I can create scripts, shot lists, storyboards, and creator briefs for this campaign.",
    },
  ],
  analytics: [
    {
      role: "assistant",
      text: "I can inspect campaign signals and convert them into next actions for the team.",
    },
  ],
};

const campaignMetrics = [
  { label: "Readiness", value: "72%", icon: CheckCircle2 },
  { label: "Content Queue", value: "18", icon: MessageSquareText },
  { label: "Launch Window", value: "23d", icon: Target },
  { label: "Projected Lift", value: "+19%", icon: TrendingUp },
];

export default function Dashboard() {
  const [campaignId, setCampaignId] = useState(campaigns[0].id);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>("orchestrator");
  const [draft, setDraft] = useState("");
  const [chatByAgent, setChatByAgent] =
    useState<Record<AgentId, ChatMessage[]>>(initialChat);

  const campaign = useMemo(
    () => campaigns.find((item) => item.id === campaignId) ?? campaigns[0],
    [campaignId]
  );

  const activeAgent = useMemo(
    () => agents.find((agent) => agent.id === activeAgentId) ?? agents[0],
    [activeAgentId]
  );

  const chatMessages = chatByAgent[activeAgentId];

  const sendMessage = (message = draft) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    setChatByAgent((current) => ({
      ...current,
      [activeAgentId]: [
        ...current[activeAgentId],
        { role: "user", text: trimmed },
        {
          role: "assistant",
          text:
            activeAgentId === "orchestrator"
              ? `I will coordinate the campaign agents for "${campaign.name}" around: ${trimmed}`
              : `${activeAgent.name} is working inside "${campaign.name}" on: ${trimmed}`,
        },
      ],
    }));
    setDraft("");
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0D1018] px-4 py-5 lg:block">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-md bg-white text-cosmic">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">CMO.ai</p>
              <p className="text-xs text-white/50">Campaign workspace</p>
            </div>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = agent.id === activeAgentId;

              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-white text-cosmic"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`size-5 shrink-0 ${
                      isActive ? "text-cosmic" : agent.accent
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {agent.shortName}
                    </span>
                    <span
                      className={`block truncate text-xs ${
                        isActive ? "text-cosmic/60" : "text-white/40"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 opacity-50" />
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b border-white/10 bg-[#0D1018]/95 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Active campaign
                </p>
                <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                  <select
                    value={campaignId}
                    onChange={(event) => setCampaignId(event.target.value)}
                    className="h-11 w-full rounded-md border border-white/10 bg-white px-3 text-sm font-semibold text-cosmic outline-none md:w-72"
                  >
                    {campaigns.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <Button className="h-11 bg-neonBlue px-4 text-cosmic hover:bg-neonBlue/90">
                    <Plus className="size-4" />
                    New Campaign
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {campaignMetrics.map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="min-w-32 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-white/50">
                        <Icon className="size-4" />
                        <span className="text-xs">{metric.label}</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">{metric.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="grid min-h-[calc(100vh-96px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="min-w-0 px-4 py-5 md:px-6">
              <div className="mb-5 grid gap-3 lg:hidden">
                <select
                  value={activeAgentId}
                  onChange={(event) =>
                    setActiveAgentId(event.target.value as AgentId)
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white px-3 text-sm font-semibold text-cosmic outline-none"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <CampaignBrief campaign={campaign} />

              {activeAgentId === "orchestrator" ? (
                <OrchestratorPanel
                  campaign={campaign}
                  onPickAgent={setActiveAgentId}
                />
              ) : (
                <AgentPanel agent={activeAgent} />
              )}
            </section>

            <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
              <div className="flex h-full min-h-[560px] flex-col">
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
                      <activeAgent.icon className={`size-5 ${activeAgent.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {activeAgent.name}
                      </p>
                      <p className="truncate text-xs text-white/45">
                        {campaign.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-md px-3 py-2 text-sm leading-6 ${
                        message.role === "user"
                          ? "ml-8 bg-neonBlue text-cosmic"
                          : "mr-8 bg-white/[0.07] text-white/80"
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-4">
                  <div className="mb-3 grid gap-2">
                    {nextActions[activeAgentId].slice(0, 3).map((action) => (
                      <button
                        key={action}
                        onClick={() => sendMessage(action)}
                        className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/70 transition hover:border-neonBlue/60 hover:text-white"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendMessage();
                    }}
                  >
                    <Input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={`Ask ${activeAgent.shortName}`}
                      className="h-11 border-white/10 bg-white text-cosmic placeholder:text-slate-500"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-11 w-11 bg-neonPink text-white hover:bg-neonPink/90"
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function CampaignBrief({ campaign }: { campaign: Campaign }) {
  return (
    <section className="mb-5 rounded-md border border-white/10 bg-white/[0.04] p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="min-w-0">
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">
            Campaign brief
          </p>
          <h1 className="truncate text-2xl font-semibold md:text-3xl">
            {campaign.name}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
            {campaign.goal}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
          <BriefStat label="Stage" value={campaign.stage} />
          <BriefStat label="Launch" value={campaign.launchDate} />
        </div>
      </div>
    </section>
  );
}

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}

function OrchestratorPanel({
  campaign,
  onPickAgent,
}: {
  campaign: Campaign;
  onPickAgent: (agentId: AgentId) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-neonBlue">
            <Megaphone className="size-5" />
            <h2 className="text-lg font-semibold">Orchestrator Queue</h2>
          </div>

          <div className="mt-4 grid gap-3">
            {[
              "Align brand voice before the first launch email.",
              "Fill image prompts for conversion posts and retargeting ads.",
              "Connect analytics baseline before paid spend starts.",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-md border border-white/10 bg-[#0D1018] p-3"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-cosmic">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Audience
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {campaign.audience}
          </p>
          <div className="mt-5 h-2 rounded-full bg-white/10">
            <div className="h-2 w-[72%] rounded-full bg-neonBlue" />
          </div>
          <p className="mt-2 text-xs text-white/45">72% ready</p>
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
                onClick={() => onPickAgent(agent.id)}
                className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-neonBlue/60 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className={`size-5 shrink-0 ${agent.accent}`} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{agent.name}</p>
                      <p className="mt-1 truncate text-xs text-white/45">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-white/35" />
                </div>

                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-white"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/45">{agent.status}</p>
              </button>
            );
          })}
      </section>
    </div>
  );
}

function AgentPanel({ agent }: { agent: Agent }) {
  const Icon = agent.icon;

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-white/10">
              <Icon className={`size-5 ${agent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                Agent workspace
              </p>
              <h2 className="mt-1 text-2xl font-semibold">{agent.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                {agent.description}
              </p>
            </div>
          </div>

          <div className="w-full rounded-md border border-white/10 bg-[#0D1018] p-3 md:w-48">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Progress</span>
              <span className="font-semibold">{agent.progress}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-neonBlue"
                style={{ width: `${agent.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {agentHistory[agent.id].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-md border border-white/10 bg-[#0D1018] p-3"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-neonGreen" />
              <p className="text-sm leading-6 text-white/75">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <p className="mt-2 text-lg font-semibold">{agent.status}</p>

        <div className="mt-5 grid gap-2">
          {nextActions[agent.id].map((action) => (
            <div
              key={action}
              className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-sm text-white/70"
            >
              {action}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
