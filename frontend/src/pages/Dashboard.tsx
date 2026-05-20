import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Image,
  LayoutDashboard,
  Loader2,
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
import { Skeleton } from "../components/ui/skeleton";
import { NewCampaignModal } from "../components/NewCampaignModal";
import { useCampaign } from "../hooks/useCampaign";
import { getAnalyticsChannels, getAnalyticsOverview } from "../services/analyticsService";
import { listAssets } from "../services/assetsService";
import { getContentCalendar } from "../services/contentCalendarService";
import { generateContent } from "../services/contentAgentService";
import { getDashboardUpcoming } from "../services/dashboardService";
import {
  quickActionBlogPost,
  quickActionImagePrompt,
} from "../services/quickActionsService";
import type {
  AnalyticsOverview,
  CampaignOut,
  CampaignStatusApi,
  ChannelBreakdown,
  ContentAgentPlatform,
  ContentAgentType,
  ContentCalendarMap,
  TextAgentResponse,
} from "../types/api";

type ChatMessage = { role: "user" | "assistant"; text: string };

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
  icon: typeof Bot;
  accent: string;
  /** Static sidebar subtitle (agent session labels not available yet). */
  navSubtitle: string;
};

const agents: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    shortName: "Dashboard",
    description: "Campaign command center",
    icon: LayoutDashboard,
    accent: "text-neonBlue",
    navSubtitle: "Campaign workspace",
  },
  {
    id: "brand",
    name: "Brand Coaching",
    shortName: "Brand",
    description: "Positioning, voice, audience fit",
    icon: Sparkles,
    accent: "text-neonPurple",
    navSubtitle: "Brand identity",
  },
  {
    id: "calendar",
    name: "Market Calendar",
    shortName: "Calendar",
    description: "Campaign timing and content cadence",
    icon: CalendarDays,
    accent: "text-neonBlue",
    navSubtitle: "Content planning",
  },
  {
    id: "text",
    name: "Text Generation",
    shortName: "Text",
    description: "Posts, ads, emails, landing copy",
    icon: PenLine,
    accent: "text-neonPink",
    navSubtitle: "Copy generation",
  },
  {
    id: "image",
    name: "Image Generation",
    shortName: "Image",
    description: "Visual briefs and campaign assets",
    icon: Image,
    accent: "text-neonYellow",
    navSubtitle: "Visual assets",
  },
  {
    id: "video",
    name: "Video Generation",
    shortName: "Video",
    description: "Scripts, storyboards, shorts",
    icon: Clapperboard,
    accent: "text-neonGreen",
    navSubtitle: "Video production",
  },
  {
    id: "analytics",
    name: "Performance Analytics",
    shortName: "Analytics",
    description: "Signals, learnings, next moves",
    icon: BarChart3,
    accent: "text-neonBlue",
    navSubtitle: "Performance data",
  },
];

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

function mapCampaignStatusToStage(status: CampaignStatusApi): string {
  if (status === "Draft") return "Planning";
  if (status === "In Progress") return "Launch planning";
  if (status === "Completed") return "Completed";
  return status;
}

function formatLaunchDate(iso: string | null | undefined): string {
  if (!iso) return "Not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not set";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function launchWindowDaysFromStart(startDate: string | null | undefined): string {
  if (!startDate) return "--";
  const end = new Date(startDate);
  const start = new Date();
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return `${days}d`;
}

export default function Dashboard() {
  const {
    campaigns,
    campaign,
    campaignId,
    setCampaignId,
    isLoading: campaignLoading,
    error: campaignError,
    brandAudience,
    registerNewCampaign,
  } = useCampaign();

  const [activeAgentId, setActiveAgentId] = useState<AgentId>("orchestrator");
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [upcoming, setUpcoming] = useState<Awaited<
    ReturnType<typeof getDashboardUpcoming>
  > | null>(null);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultBody, setResultBody] = useState("");

  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [textChatMessages, setTextChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "I can write campaign copy, compare angles, or expand the approved strategy into drafts.",
    },
  ]);
  const [textLastResult, setTextLastResult] = useState<TextAgentResponse | null>(
    null
  );
  const [textDraft, setTextDraft] = useState("");

  const [calendarData, setCalendarData] = useState<ContentCalendarMap | null>(
    null
  );
  const [calendarMessage, setCalendarMessage] = useState<string | null>(null);
  const [channelsView, setChannelsView] = useState<ChannelBreakdown[] | null>(
    null
  );

  const activeAgent = useMemo(
    () => agents.find((a) => a.id === activeAgentId) ?? agents[0],
    [activeAgentId]
  );

  useEffect(() => {
    if (!campaignId) {
      setUpcoming(null);
      return;
    }
    setUpcomingLoading(true);
    setUpcomingError(null);
    void getDashboardUpcoming()
      .then(setUpcoming)
      .catch((e) => {
        setUpcomingError(
          e instanceof Error ? e.message : "Something went wrong"
        );
        setUpcoming(null);
      })
      .finally(() => setUpcomingLoading(false));
  }, [campaignId]);

  const showResult = useCallback((title: string, body: string) => {
    setResultTitle(title);
    setResultBody(body);
    setResultOpen(true);
  }, []);

  const readinessDisplay = "N/A";
  const projectedLiftDisplay = "N/A";

  const contentQueueDisplay = useMemo(() => {
    if (upcomingLoading) return "…";
    if (upcomingError) return "—";
    if (!upcoming) return "—";
    return String(upcoming.length);
  }, [upcoming, upcomingLoading, upcomingError]);

  const launchWindowDisplay = useMemo(() => {
    if (!campaign?.start_date) return "--";
    return launchWindowDaysFromStart(campaign.start_date);
  }, [campaign?.start_date]);

  const handleCalendarGenerate14 = useCallback(async () => {
    if (!campaign?.strategy_id) {
      setCalendarMessage("No strategy linked to this campaign yet");
      setCalendarData(null);
      return;
    }
    setBusyAction("cal14");
    setCalendarMessage(null);
    try {
      const now = new Date();
      const data = await getContentCalendar({
        strategy_id: campaign.strategy_id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setCalendarData(data);
      setChannelsView(null);
    } catch (e) {
      setCalendarMessage(
        e instanceof Error ? e.message : "Something went wrong"
      );
      setCalendarData(null);
    } finally {
      setBusyAction(null);
    }
  }, [campaign]);

  const handleCalendarBalance = useCallback(async () => {
    setBusyAction("channels");
    setCalendarMessage(null);
    try {
      const rows = await getAnalyticsChannels();
      setChannelsView(rows);
      setCalendarData(null);
    } catch (e) {
      setCalendarMessage(
        e instanceof Error ? e.message : "Something went wrong"
      );
      setChannelsView(null);
    } finally {
      setBusyAction(null);
    }
  }, []);

  const runTextGenerate = useCallback(
    async (
      message: string,
      content_type: ContentAgentType,
      platform: ContentAgentPlatform | null,
      busyKey: string
    ) => {
      if (!campaign || campaignId == null) return;
      setBusyAction(busyKey);
      setTextChatMessages((prev) => [...prev, { role: "user", text: message }]);
      try {
        const res = await generateContent({
          message,
          campaign_id: campaignId,
          content_type,
          platform: platform ?? undefined,
        });
        setTextLastResult(res);
        const formatted = formatTextAgentResponse(res);
        setTextChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: formatted },
        ]);
        showResult("Generated content", formatted);
      } catch (e) {
        const err =
          e instanceof Error ? e.message : "Something went wrong";
        setTextChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: err },
        ]);
        showResult("Error", err);
      } finally {
        setBusyAction(null);
      }
    },
    [campaign, campaignId, showResult]
  );

  const handleTextLinkedIn = useCallback(() => {
    if (!campaign) return;
    void runTextGenerate(
      `Write a LinkedIn post for ${campaign.name}`,
      "social_media_post",
      "linkedin",
      "li"
    );
  }, [campaign, runTextGenerate]);

  const handleTextEmail = useCallback(() => {
    if (!campaign) return;
    void runTextGenerate(
      `Draft an email sequence for ${campaign.name}`,
      "email_campaign",
      "email",
      "email"
    );
  }, [campaign, runTextGenerate]);

  const handleTextHooks = useCallback(() => {
    if (!campaign) return;
    void runTextGenerate(
      `Create ad hook directions for ${campaign.name}`,
      "promotional_message",
      "linkedin",
      "hooks"
    );
  }, [campaign, runTextGenerate]);

  const handleTextChatSend = useCallback(
    (message = textDraft) => {
      const trimmed = message.trim();
      if (!trimmed || !campaign) return;
      setTextDraft("");
      void runTextGenerate(
        trimmed,
        "social_media_post",
        "instagram",
        "textchat"
      );
    },
    [textDraft, campaign, runTextGenerate]
  );

  const handleImagePrompt = useCallback(async () => {
    if (!campaign) return;
    setBusyAction("imgp");
    try {
      const res = await quickActionImagePrompt({
        prompt: `Campaign visual for ${campaign.name}`,
        brand_id: campaign.brand_id,
      });
      showResult("Image prompt", res.result);
    } catch (e) {
      showResult(
        "Error",
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setBusyAction(null);
    }
  }, [campaign, showResult]);

  const handleImageAssets = useCallback(async () => {
    if (!campaign) return;
    setBusyAction("assets");
    try {
      const list = await listAssets({ campaign_id: campaign.id });
      const text =
        list.length === 0
          ? "No assets found for this campaign."
          : list
              .map(
                (a) =>
                  `• ${a.name} (${a.asset_type}) — ${a.url.slice(0, 80)}${a.url.length > 80 ? "…" : ""}`
              )
              .join("\n");
      showResult("Campaign assets", text);
    } catch (e) {
      showResult(
        "Error",
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setBusyAction(null);
    }
  }, [campaign, showResult]);

  const handleVideoScript = useCallback(async () => {
    if (!campaign) return;
    setBusyAction("vscript");
    try {
      const res = await quickActionBlogPost({
        topic: `30-second video script for ${campaign.name}`,
        brand_id: campaign.brand_id,
      });
      showResult("Video script", res.result);
    } catch (e) {
      showResult(
        "Error",
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setBusyAction(null);
    }
  }, [campaign, showResult]);

  const handleVideoCreatorBrief = useCallback(async () => {
    if (!campaign) return;
    setBusyAction("vbrief");
    try {
      const res = await quickActionBlogPost({
        topic: `Creator brief for ${campaign.name}`,
        brand_id: campaign.brand_id,
      });
      showResult("Creator brief", res.result);
    } catch (e) {
      showResult(
        "Error",
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setBusyAction(null);
    }
  }, [campaign, showResult]);

  const handleAnalyticsSummarize = useCallback(async () => {
    setBusyAction("asum");
    try {
      const o = await getAnalyticsOverview();
      const body = [
        `Total Reach: ${o.total_reach}`,
        `Engagement Rate: ${o.avg_engagement_rate}%`,
        `Clicks: ${o.total_clicks}`,
        `Conversions: ${o.total_conversions}`,
        `Impressions: ${o.total_impressions}`,
      ].join("\n");
      showResult("Performance summary", body);
    } catch (e) {
      showResult(
        "Error",
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setBusyAction(null);
    }
  }, [showResult]);

  if (campaignLoading && !campaign && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-[#090A0F] p-8 text-white">
        <div className="mx-auto max-w-lg space-y-3">
          <Skeleton className="h-10 w-full bg-white/10" />
          <Skeleton className="h-32 w-full bg-white/10" />
          <Skeleton className="h-48 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-white">
      <ResultDialog
        open={resultOpen}
        title={resultTitle}
        body={resultBody}
        onOpenChange={setResultOpen}
      />
      <NewCampaignModal
        open={newCampaignOpen}
        onOpenChange={setNewCampaignOpen}
        onCreated={registerNewCampaign}
      />

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
                  type="button"
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
                      {agent.navSubtitle}
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
                    aria-label="Active campaign"
                    value={campaignId ?? ""}
                    onChange={(event) => {
                      const v = event.target.value;
                      if (v) setCampaignId(Number.parseInt(v, 10));
                    }}
                    disabled={!campaigns.length}
                    className="h-11 w-full rounded-md border border-white/10 bg-white px-3 text-sm font-semibold text-cosmic outline-none md:w-72 disabled:opacity-50"
                  >
                    {!campaigns.length ? (
                      <option value="">No campaigns</option>
                    ) : (
                      campaigns.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))
                    )}
                  </select>

                  <Button
                    type="button"
                    className="h-11 bg-neonBlue px-4 text-cosmic hover:bg-neonBlue/90"
                    onClick={() => setNewCampaignOpen(true)}
                  >
                    <Plus className="size-4" />
                    New Campaign
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {/*
                  AGENT_REQUIRED: orchestrator_agent
                  Readiness % requires the orchestrator_agent to be connected.
                  Endpoint: POST /api/v1/agents/orchestrator/session
                  Integration point: Replace this placeholder when the agent is delivered.
                */}
                <MetricCard
                  label="Readiness"
                  value={readinessDisplay}
                  icon={CheckCircle2}
                />
                <MetricCard
                  label="Content Queue"
                  value={contentQueueDisplay}
                  icon={MessageSquareText}
                />
                <MetricCard
                  label="Launch Window"
                  value={launchWindowDisplay}
                  icon={Target}
                />
                {/*
                  AGENT_REQUIRED: analytics_agent
                  Projected lift requires the analytics_agent to be connected.
                  Endpoint: POST /api/v1/agents/analytics/session
                  Integration point: Replace this placeholder when the agent is delivered.
                */}
                <MetricCard
                  label="Projected Lift"
                  value={projectedLiftDisplay}
                  icon={TrendingUp}
                />
              </div>
            </div>
          </header>

          {campaignError ? (
            <div className="border-b border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:px-6">
              {campaignError}
            </div>
          ) : null}

          <div className="grid min-h-[calc(100vh-96px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="min-w-0 px-4 py-5 md:px-6">
              <div className="mb-5 grid gap-3 lg:hidden">
                <select
                  aria-label="Active agent workspace"
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

              {!campaign && !campaignLoading ? (
                <div className="rounded-md border border-white/10 bg-white/[0.04] p-8 text-center text-white/70">
                  <p className="text-lg font-medium text-white">
                    No campaigns yet
                  </p>
                  <p className="mt-2 text-sm">
                    Create a campaign to populate this workspace.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 bg-neonBlue text-cosmic hover:bg-neonBlue/90"
                    onClick={() => setNewCampaignOpen(true)}
                  >
                    <Plus className="size-4" />
                    New Campaign
                  </Button>
                </div>
              ) : campaign ? (
                <>
                  <CampaignBrief campaign={campaign} />

                  {activeAgentId === "orchestrator" ? (
                    <OrchestratorPanel
                      brandAudience={brandAudience}
                      onPickAgent={setActiveAgentId}
                    />
                  ) : activeAgentId === "brand" ? (
                    <BrandPanels />
                  ) : activeAgentId === "calendar" ? (
                    <CalendarPanels
                      calendarData={calendarData}
                      calendarMessage={calendarMessage}
                      channelsView={channelsView}
                      busyAction={busyAction}
                      onGenerate14={handleCalendarGenerate14}
                      onBalance={handleCalendarBalance}
                    />
                  ) : activeAgentId === "text" ? (
                    <TextPanels
                      busyAction={busyAction}
                      lastResult={textLastResult}
                      onLinkedIn={handleTextLinkedIn}
                      onEmail={handleTextEmail}
                      onHooks={handleTextHooks}
                    />
                  ) : activeAgentId === "image" ? (
                    <ImagePanels
                      busyAction={busyAction}
                      onPrompt={handleImagePrompt}
                      onAssets={handleImageAssets}
                    />
                  ) : activeAgentId === "video" ? (
                    <VideoPanels
                      busyAction={busyAction}
                      onScript={handleVideoScript}
                      onCreatorBrief={handleVideoCreatorBrief}
                    />
                  ) : (
                    <AnalyticsPanels
                      busyAction={busyAction}
                      onSummarize={handleAnalyticsSummarize}
                    />
                  )}
                </>
              ) : (
                <div className="space-y-3 py-6">
                  <Skeleton className="h-24 w-full bg-white/10" />
                  <Skeleton className="h-48 w-full bg-white/10" />
                </div>
              )}
            </section>

            <RightPanel
              activeAgent={activeAgent}
              campaign={campaign}
              nextActions={nextActions[activeAgentId]}
              onCalendar14={handleCalendarGenerate14}
              onCalendarBalance={handleCalendarBalance}
              onTextLi={handleTextLinkedIn}
              onTextEmail={handleTextEmail}
              onTextHooks={handleTextHooks}
              textChatMessages={textChatMessages}
              textDraft={textDraft}
              onTextDraftChange={setTextDraft}
              onTextChatSend={handleTextChatSend}
              onImgPrompt={handleImagePrompt}
              onImgAssets={handleImageAssets}
              onVideoScript={handleVideoScript}
              onVideoBrief={handleVideoCreatorBrief}
              busyAction={busyAction}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="min-w-32 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="flex items-center gap-2 text-white/50">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function ResultDialog({
  open,
  title,
  body,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  body: string;
  onOpenChange: (v: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-dialog-title"
    >
      <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-lg border border-white/10 bg-[#0D1018] shadow-xl">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 id="result-dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
        </div>
        <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-white/85">
          {body}
        </pre>
        <div className="border-t border-white/10 p-3 text-right">
          <Button
            type="button"
            className="bg-neonBlue text-cosmic hover:bg-neonBlue/90"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function CampaignBrief({ campaign }: { campaign: CampaignOut }) {
  const stage = mapCampaignStatusToStage(campaign.status);
  const launch = formatLaunchDate(campaign.start_date);

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

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}

function OrchestratorPanel({
  brandAudience,
  onPickAgent,
}: {
  brandAudience: string | null;
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
          {/*
            AGENT_REQUIRED: orchestrator_agent
            This feature requires the orchestrator_agent to be connected.
            Endpoint: POST /api/v1/agents/orchestrator/session
            Integration point: Replace this placeholder when the agent is delivered.
          */}
          <p className="mt-4 text-sm leading-6 text-white/70">
            Agent orchestration coming soon. Connect the orchestrator agent to
            activate this queue.
          </p>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Audience
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {brandAudience?.trim() ||
              "Audience details will load from the linked brand."}
          </p>
          {/*
            AGENT_REQUIRED: brand_coach_agent
            This feature requires the brand_coach_agent to be connected.
            Endpoint: POST /api/v1/agents/brand-coach/session
            Integration point: Replace this placeholder when the agent is delivered.
            (Audience readiness progress bar — agent calculation.)
          */}
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

                {/*
                  AGENT_REQUIRED: agent_sessions
                  Card status labels and progress require agent session data — not available yet.
                  Endpoint: POST /api/v1/agents/{agent_path}/session
                  Integration point: Replace this placeholder when the agent is delivered.
                */}
                <p className="mt-4 text-xs font-medium text-white/55">Active</p>
              </button>
            );
          })}
      </section>
    </div>
  );
}

function BrandPanels() {
  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Brand Coaching</h2>
        {/*
          AGENT_REQUIRED: brand_coach_agent
          This feature requires the brand_coach_agent to be connected.
          Endpoint: POST /api/v1/agents/brand-coach/session
          Integration point: Replace this placeholder when the agent is delivered.
        */}
        <p className="mt-3 text-sm leading-6 text-white/70">
          Brand coaching agent is being integrated. This workspace will show
          positioning, voice traits, and audience analysis.
        </p>
      </section>
    </div>
  );
}

function CalendarPanels({
  calendarData,
  calendarMessage,
  channelsView,
  busyAction,
  onGenerate14,
  onBalance,
}: {
  calendarData: ContentCalendarMap | null;
  calendarMessage: string | null;
  channelsView: ChannelBreakdown[] | null;
  busyAction: string | null;
  onGenerate14: () => void;
  onBalance: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Market Calendar</h2>
        {/*
          AGENT_REQUIRED: scheduling_agent
          This feature requires the scheduling_agent to be connected.
          Endpoint: POST /api/v1/agents/scheduling/session
          Integration point: Replace this placeholder when the agent is delivered.
        */}
        <p className="mt-3 text-sm text-white/70">
          Market Calendar agent is being integrated.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            disabled={busyAction === "cal14"}
            onClick={onGenerate14}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60 disabled:opacity-50"
          >
            {busyAction === "cal14" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading…
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
                <Loader2 className="size-4 animate-spin" /> Loading…
              </span>
            ) : (
              "Balance channels"
            )}
          </button>
          <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-sm text-white/60">
            {/*
              AGENT_REQUIRED: scheduling_agent
              This feature requires the scheduling_agent to be connected.
              Endpoint: POST /api/v1/agents/scheduling/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            Find calendar gaps — Agent analysis coming soon
          </div>
        </div>

        {calendarMessage ? (
          <p className="mt-4 text-sm text-amber-200/90">{calendarMessage}</p>
        ) : null}

        {calendarData ? (
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto text-sm">
            {Object.entries(calendarData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, items]) => (
                <div key={date}>
                  <p className="font-semibold text-neonBlue">{date}</p>
                  <ul className="mt-1 list-inside list-disc text-white/70">
                    {items.map((it) => (
                      <li key={it.id}>
                        {it.title} — {it.platform}
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
                  — reach {row.total_reach}, clicks {row.total_clicks}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function TextPanels({
  busyAction,
  lastResult,
  onLinkedIn,
  onEmail,
  onHooks,
}: {
  busyAction: string | null;
  lastResult: TextAgentResponse | null;
  onLinkedIn: () => void;
  onEmail: () => void;
  onHooks: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Text Generation</h2>
        <p className="mt-2 text-sm text-white/50">
          Powered by POST /api/v1/agents/content/generate
        </p>
        {busyAction === "li" ||
        busyAction === "email" ||
        busyAction === "hooks" ||
        busyAction === "textchat" ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="size-4 animate-spin" /> Generating…
          </p>
        ) : lastResult ? (
          <div className="mt-4 max-h-96 overflow-y-auto rounded-md border border-white/10 bg-[#0D1018] p-3 text-sm leading-6 text-white/80">
            <TextAgentResultBody result={lastResult} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/70">
            Use quick actions or Ask Text to generate copy for this campaign.
          </p>
        )}
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="mt-4 grid gap-2">
          <ActionRow
            label="Write LinkedIn posts"
            loading={busyAction === "li"}
            onClick={onLinkedIn}
          />
          <ActionRow
            label="Draft email sequence"
            loading={busyAction === "email"}
            onClick={onEmail}
          />
          <ActionRow
            label="Create ad hooks"
            loading={busyAction === "hooks"}
            onClick={onHooks}
          />
        </div>
      </section>
    </div>
  );
}

function ImagePanels({
  busyAction,
  onPrompt,
  onAssets,
}: {
  busyAction: string | null;
  onPrompt: () => void;
  onAssets: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Image Generation</h2>
        {/*
          AGENT_REQUIRED: image_ads_agent
          This feature requires the image_ads_agent to be connected.
          Endpoint: POST /api/v1/agents/image-ads/session
          Integration point: Replace this placeholder when the agent is delivered.
        */}
        <p className="mt-3 text-sm text-white/70">
          Image workspace (progress and tasks) will appear here when the image
          agent is connected.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="mt-4 grid gap-2">
          <ActionRow
            label="Create image prompts"
            loading={busyAction === "imgp"}
            onClick={onPrompt}
          />
          <ActionRow
            label="Draft asset briefs"
            loading={busyAction === "assets"}
            onClick={onAssets}
          />
          <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-sm text-white/60">
            {/*
              AGENT_REQUIRED: image_ads_agent
              This feature requires the image_ads_agent to be connected.
              Endpoint: POST /api/v1/agents/image-ads/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            Review visual consistency — Visual consistency review requires image
            agent
          </div>
        </div>
      </section>
    </div>
  );
}

function VideoPanels({
  busyAction,
  onScript,
  onCreatorBrief,
}: {
  busyAction: string | null;
  onScript: () => void;
  onCreatorBrief: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Video Generation</h2>
        {/*
          AGENT_REQUIRED: video_agent
          This feature requires the video_agent to be connected.
          Endpoint: POST /api/v1/agents/video/session
          Integration point: Replace this placeholder when the agent is delivered.
        */}
        <p className="mt-3 text-sm text-white/70">
          Video workspace will appear here when the video agent is connected.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="mt-4 grid gap-2">
          <ActionRow
            label="Write short video script"
            loading={busyAction === "vscript"}
            onClick={onScript}
          />
          <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-sm text-white/60">
            {/*
              AGENT_REQUIRED: video_agent
              This feature requires the video_agent to be connected.
              Endpoint: POST /api/v1/agents/video/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            Create storyboard — requires video agent
          </div>
          <ActionRow
            label="Plan creator brief"
            loading={busyAction === "vbrief"}
            onClick={onCreatorBrief}
          />
        </div>
      </section>
    </div>
  );
}

function AnalyticsPanels({
  busyAction,
  onSummarize,
}: {
  busyAction: string | null;
  onSummarize: () => void;
}) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [channels, setChannels] = useState<ChannelBreakdown[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadErr(null);
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
      ? "—"
      : overview.total_impressions === 0
        ? "Awaiting data"
        : "Data available";

  const activityLabel =
    overview == null
      ? "—"
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
          <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="size-4 animate-spin" /> Loading analytics…
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

        {/*
          AGENT_REQUIRED: analytics_agent
          Prior fake “completed tasks” and agent-driven progress belong here.
          Endpoint: POST /api/v1/agents/analytics/session
          Integration point: Replace this placeholder when the agent is delivered.
        */}
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <p className="mt-2 text-lg font-semibold">{statusLine}</p>
        <div className="mt-4 grid gap-2">
          <ActionRow
            label="Summarize performance"
            loading={busyAction === "asum"}
            onClick={onSummarize}
          />
          <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-sm text-white/60">
            {/*
              AGENT_REQUIRED: analytics_agent
              This feature requires the analytics_agent to be connected.
              Endpoint: POST /api/v1/agents/analytics/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            Find weak funnel step — Funnel analysis requires analytics agent
          </div>
          <div className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-sm text-white/60">
            {/*
              AGENT_REQUIRED: analytics_agent
              This feature requires the analytics_agent to be connected.
              Endpoint: POST /api/v1/agents/analytics/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            Suggest budget shift — requires analytics agent
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionRow({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60 disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </span>
      ) : (
        label
      )}
    </button>
  );
}

function RightPanel({
  activeAgent,
  campaign,
  nextActions,
  onCalendar14,
  onCalendarBalance,
  onTextLi,
  onTextEmail,
  onTextHooks,
  textChatMessages,
  textDraft,
  onTextDraftChange,
  onTextChatSend,
  onImgPrompt,
  onImgAssets,
  onVideoScript,
  onVideoBrief,
  busyAction,
}: {
  activeAgent: Agent;
  campaign: CampaignOut | null;
  nextActions: string[];
  onCalendar14: () => void;
  onCalendarBalance: () => void;
  onTextLi: () => void;
  onTextEmail: () => void;
  onTextHooks: () => void;
  textChatMessages: ChatMessage[];
  textDraft: string;
  onTextDraftChange: (v: string) => void;
  onTextChatSend: (message?: string) => void;
  onImgPrompt: () => void;
  onImgAssets: () => void;
  onVideoScript: () => void;
  onVideoBrief: () => void;
  busyAction: string | null;
}) {
  const Icon = activeAgent.icon;

  if (activeAgent.id === "orchestrator") {
    return (
      <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
        <div className="flex h-full min-h-[560px] flex-col">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
                <Icon className={`size-5 ${activeAgent.accent}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Orchestrator</p>
                <p className="truncate text-xs text-white/45">
                  {campaign?.name ?? "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {/*
              AGENT_REQUIRED: orchestrator_agent
              This feature requires the orchestrator_agent to be connected.
              Endpoint: POST /api/v1/agents/orchestrator/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            <div className="rounded-md bg-white/[0.07] px-3 py-2 text-sm leading-6 text-white/80">
              The orchestrator agent will be available soon. It will coordinate
              all agents and route your requests.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (activeAgent.id === "brand") {
    return (
      <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
        <div className="flex h-full min-h-[560px] flex-col">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
                <Icon className={`size-5 ${activeAgent.accent}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {activeAgent.name}
                </p>
                <p className="truncate text-xs text-white/45">
                  {campaign?.name ?? "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {/*
              AGENT_REQUIRED: brand_coach_agent
              This feature requires the brand_coach_agent to be connected.
              Endpoint: POST /api/v1/agents/brand-coach/session
              Integration point: Replace this placeholder when the agent is delivered.
            */}
            <p className="text-sm text-white/70">
              Brand Coaching agent coming soon.
            </p>
          </div>
          <div className="border-t border-white/10 p-4">
            <Input
              disabled
              placeholder="Agent not connected yet"
              className="h-11 border-white/10 bg-white/5 text-white/50"
            />
          </div>
        </div>
      </aside>
    );
  }

  if (activeAgent.id === "analytics") {
    return (
      <AnalyticsRightAside
        activeAgent={activeAgent}
        campaignName={campaign?.name ?? "—"}
      />
    );
  }

  if (activeAgent.id === "text") {
    return (
      <TextRightAside
        activeAgent={activeAgent}
        campaignName={campaign?.name ?? "—"}
        messages={textChatMessages}
        draft={textDraft}
        onDraftChange={onTextDraftChange}
        onSend={onTextChatSend}
        nextActions={nextActions}
        onTextLi={onTextLi}
        onTextEmail={onTextEmail}
        onTextHooks={onTextHooks}
        busyAction={busyAction}
      />
    );
  }

  const placeholder =
    activeAgent.id === "calendar"
      ? "Calendar agent coming soon"
      : activeAgent.id === "image"
          ? "Image agent coming soon"
          : activeAgent.id === "video"
            ? "Video agent coming soon"
            : "Agent not connected yet";

  const runQuick = (label: string) => {
    if (activeAgent.id === "calendar") {
      if (label === "Generate next 14 days") void onCalendar14();
      if (label === "Balance channels") void onCalendarBalance();
    }
    if (activeAgent.id === "image") {
      if (label === "Create image prompts") void onImgPrompt();
      if (label === "Draft asset briefs") void onImgAssets();
    }
    if (activeAgent.id === "video") {
      if (label === "Write short video script") void onVideoScript();
      if (label === "Plan creator brief") void onVideoBrief();
    }
  };

  const isBusy = (label: string) => {
    if (label === "Generate next 14 days") return busyAction === "cal14";
    if (label === "Balance channels") return busyAction === "channels";
    if (label === "Write LinkedIn posts") return busyAction === "li";
    if (label === "Draft email sequence") return busyAction === "email";
    if (label === "Create ad hooks") return busyAction === "hooks";
    if (label === "Create image prompts") return busyAction === "imgp";
    if (label === "Draft asset briefs") return busyAction === "assets";
    if (label === "Write short video script") return busyAction === "vscript";
    if (label === "Plan creator brief") return busyAction === "vbrief";
    return false;
  };

  return (
    <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
      <div className="flex h-full min-h-[560px] flex-col">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
              <Icon className={`size-5 ${activeAgent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeAgent.name}</p>
              <p className="truncate text-xs text-white/45">
                {campaign?.name ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {/*
            AGENT_REQUIRED: {agent}_agent
            Chat transcript requires the respective agent session.
            Endpoint: POST /api/v1/agents/{agent_path}/session
            Integration point: Replace this placeholder when the agent is delivered.
          */}
          <div className="rounded-md bg-white/[0.07] px-3 py-2 text-sm leading-6 text-white/80">
            {placeholder}
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 grid gap-2">
            {nextActions.map((action) => {
              if (
                activeAgent.id === "calendar" &&
                action === "Find calendar gaps"
              ) {
                return (
                  <div
                    key={action}
                    className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/45"
                  >
                    {action}
                  </div>
                );
              }
              if (
                activeAgent.id === "image" &&
                action === "Review visual consistency"
              ) {
                return (
                  <div
                    key={action}
                    className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/45"
                  >
                    {action}
                  </div>
                );
              }
              if (
                activeAgent.id === "video" &&
                action === "Create storyboard"
              ) {
                return (
                  <div
                    key={action}
                    className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/45"
                  >
                    {action}
                  </div>
                );
              }
              return (
                <button
                  key={action}
                  type="button"
                  disabled={isBusy(action)}
                  onClick={() => runQuick(action)}
                  className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/70 transition hover:border-neonBlue/60 hover:text-white disabled:opacity-50"
                >
                  {isBusy(action) ? "Loading…" : action}
                </button>
              );
            })}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Input
              disabled
              placeholder={`Ask ${activeAgent.shortName}`}
              className="h-11 border-white/10 bg-white/5 text-white/50"
            />
            <Button
              type="button"
              size="icon"
              disabled
              className="h-11 w-11 bg-neonPink/40 text-white"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function AnalyticsRightAside({
  activeAgent,
  campaignName,
}: {
  activeAgent: Agent;
  campaignName: string;
}) {
  const Icon = activeAgent.icon;
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [channels, setChannels] = useState<ChannelBreakdown[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
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
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
              <Icon className={`size-5 ${activeAgent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {activeAgent.name}
              </p>
              <p className="truncate text-xs text-white/45">{campaignName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm text-white/80">
          {loading ? (
            <p className="flex items-center gap-2 text-white/60">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </p>
          ) : err ? (
            <p className="text-red-300">{err}</p>
          ) : overview ? (
            <>
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

        <div className="border-t border-white/10 p-4">
          {/*
            AGENT_REQUIRED: analytics_agent
            This feature requires the analytics_agent to be connected.
            Endpoint: POST /api/v1/agents/analytics/session
            Integration point: Replace this placeholder when the agent is delivered.
          */}
          <Input
            disabled
            placeholder="Analytics agent coming soon"
            className="h-11 border-white/10 bg-white/5 text-white/50"
          />
        </div>
      </div>
    </aside>
  );
}

function formatTextAgentResponse(res: TextAgentResponse): string {
  const parts: string[] = [];
  if (res.subject_line) {
    parts.push(`Subject: ${res.subject_line}`);
  }
  parts.push(res.generated_content);
  if (res.hashtags?.length) {
    parts.push(`\nHashtags: ${res.hashtags.join(" ")}`);
  }
  if (res.variations?.length) {
    parts.push("\nVariations:");
    for (const v of res.variations) {
      parts.push(`\nVariation ${v.variation_id}:\n${v.content}`);
    }
  }
  if (res.seo) {
    parts.push(
      `\nSEO title: ${res.seo.suggested_title}\nMeta: ${res.seo.meta_description}\nKeywords: ${res.seo.keywords.join(", ")}`
    );
  }
  if (res.char_count != null) {
    parts.push(
      `\n${res.char_count} characters${res.within_limit === false ? " (over limit)" : ""}`
    );
  }
  return parts.join("\n");
}

function TextAgentResultBody({ result }: { result: TextAgentResponse }) {
  return (
    <div className="space-y-3 whitespace-pre-wrap">
      {result.subject_line ? (
        <p>
          <span className="text-white/50">Subject: </span>
          {result.subject_line}
        </p>
      ) : null}
      <p>{result.generated_content}</p>
      {result.hashtags?.length ? (
        <p className="text-neonBlue">{result.hashtags.join(" ")}</p>
      ) : null}
      {result.variations?.map((v) => (
        <div
          key={v.variation_id}
          className="rounded border border-white/10 p-2"
        >
          <p className="text-xs text-white/45">Variation {v.variation_id}</p>
          <p className="mt-1">{v.content}</p>
        </div>
      ))}
      {result.char_count != null ? (
        <p className="text-xs text-white/45">{result.char_count} characters</p>
      ) : null}
    </div>
  );
}

function TextRightAside({
  activeAgent,
  campaignName,
  messages,
  draft,
  onDraftChange,
  onSend,
  nextActions,
  onTextLi,
  onTextEmail,
  onTextHooks,
  busyAction,
}: {
  activeAgent: Agent;
  campaignName: string;
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: (message?: string) => void;
  nextActions: string[];
  onTextLi: () => void;
  onTextEmail: () => void;
  onTextHooks: () => void;
  busyAction: string | null;
}) {
  const Icon = activeAgent.icon;
  const isBusy =
    busyAction === "li" ||
    busyAction === "email" ||
    busyAction === "hooks" ||
    busyAction === "textchat";

  const runQuick = (label: string) => {
    if (label === "Write LinkedIn posts") onTextLi();
    if (label === "Draft email sequence") onTextEmail();
    if (label === "Create ad hooks") onTextHooks();
  };

  return (
    <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
      <div className="flex h-full min-h-[560px] flex-col">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
              <Icon className={`size-5 ${activeAgent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeAgent.name}</p>
              <p className="truncate text-xs text-white/45">{campaignName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-md px-3 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-8 bg-neonBlue text-cosmic"
                  : "mr-8 bg-white/[0.07] text-white/80"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          ))}
          {isBusy ? (
            <p className="flex items-center gap-2 text-xs text-white/50">
              <Loader2 className="size-3 animate-spin" /> Generating…
            </p>
          ) : null}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 grid gap-2">
            {nextActions.map((action) => (
              <button
                key={action}
                type="button"
                disabled={isBusy}
                onClick={() => runQuick(action)}
                className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/70 transition hover:border-neonBlue/60 hover:text-white disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
          >
            <Input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              disabled={isBusy}
              placeholder="Ask Text"
              className="h-11 border-white/10 bg-white text-cosmic placeholder:text-slate-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isBusy || !draft.trim()}
              className="h-11 w-11 bg-neonPink text-white hover:bg-neonPink/90"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
