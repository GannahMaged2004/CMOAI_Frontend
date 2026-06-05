import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { BrandOut, CampaignOut } from "../../../types/api";
import { PANEL_CLASS, SUBPANEL_CLASS } from "../constants";
import { BriefStat } from "../components/CampaignBrief";

type PlannerFormState = {
  brandName: string;
  targetAudience: string;
  industry: string;
  budget: number;
  productService: string;
  mainGoal: string;
  platforms: string[];
};

type ContentPillar = {
  pillar: string;
  format: string;
  message: string;
  frequency: string;
};

type PostingRow = {
  day: string;
  primary: string;
  secondary: string;
};

type GeneratedPlan = {
  contentPillars: ContentPillar[];
  postingSchedule: PostingRow[];
  closingNote: string;
  nextSteps: string[];
};

const PLATFORM_OPTIONS = [
  "Instagram",
  "TikTok",
  "Facebook",
  "LinkedIn",
  "YouTube",
];

const GOAL_OPTIONS = [
  "Increase Sales",
  "Generate Leads",
  "Grow Awareness",
  "Build Community",
];

const isTravelBrand = (industry: string, productService: string) =>
  /travel|trip|tour|vacation|destination|hotel|hospitality/i.test(
    `${industry} ${productService}`,
  );

function buildGeneratedPlan(form: PlannerFormState): GeneratedPlan {
  const brandName = form.brandName.trim() || "This brand";
  const audience = form.targetAudience.trim() || "the target audience";
  const budgetLabel = `$${form.budget.toLocaleString("en-US")}`;
  const primaryPlatform = form.platforms[0] ?? "Instagram";
  const secondaryPlatform = form.platforms[1] ?? "TikTok";
  const isTravel = isTravelBrand(form.industry, form.productService);

  if (isTravel) {
    return {
      contentPillars: [
        {
          pillar: "Destination Inspiration",
          format: "15-30 sec reels/TikToks, carousel posts, IG Stories",
          message: `Imagine yourself there - the sights, sounds, and flavors ${brandName} can unlock.`,
          frequency: "3 posts/week",
        },
        {
          pillar: "Travel Tips & Hacks",
          format: "Quick-tip videos, carousel checklists, did-you-know stories",
          message: "Travel smarter, spend less, stay safe.",
          frequency: "2 posts/week",
        },
        {
          pillar: "Customer Stories (UGC)",
          format: "Reposted reels, testimonial videos, before-after carousel",
          message: `Real people, real adventures with ${brandName}.`,
          frequency: "2 posts/week",
        },
        {
          pillar: "Limited-Time Offers",
          format: "Countdown stickers, swipe-up links, deal-of-the-week TikToks",
          message: "Grab the deal before it is gone and book now.",
          frequency: "1 post/week + stories during promo",
        },
        {
          pillar: "Behind-the-Scenes (BTS)",
          format: "Day-in-the-life clips, planner spotlights, vendor snippets",
          message: `Show why ${brandName} makes complex trips feel easy.`,
          frequency: "1 post/week",
        },
      ],
      postingSchedule: [
        {
          day: "Monday",
          primary: "Carousel - destination inspiration (9 AM)",
          secondary: "Travel tip (12 PM)",
        },
        {
          day: "Tuesday",
          primary: "Reel - customer story (11 AM)",
          secondary: "30-second dream challenge highlight (3 PM)",
        },
        {
          day: "Wednesday",
          primary: "Story - flash-sale countdown (all day)",
          secondary: "Behind-the-scenes (5 PM)",
        },
        {
          day: "Thursday",
          primary: "Reel - travel hack (10 AM)",
          secondary: "Destination inspiration (6 PM)",
        },
        {
          day: "Friday",
          primary: "Post - flash-sale announcement + story countdown",
          secondary: "Live Q&A (7 PM)",
        },
        {
          day: "Saturday",
          primary: "UGC repost - community travel photo (11 AM)",
          secondary: "Travel story takeover (all day)",
        },
        {
          day: "Sunday",
          primary: "Rest / community engagement",
          secondary: "Rest / community engagement",
        },
      ],
      closingNote: `${brandName} can build a vibrant traveler community while driving meaningful bookings from ${primaryPlatform} and ${secondaryPlatform}. This plan stays within the ${budgetLabel} budget, uses visual storytelling to speak to ${audience}, and keeps conversion moments clear enough to measure.`,
      nextSteps: [
        "Approve the budget split across organic content and light paid amplification.",
        "Identify two to three micro-influencers or creator partners.",
        "Set up a landing page with UTM-enabled links for every offer.",
        "Schedule the first week of content and assign owners for replies and DMs.",
      ],
    };
  }

  return {
    contentPillars: [
      {
        pillar: "Problem Awareness",
        format: "Short videos, carousel explainers, educational posts",
        message: `Show ${audience} that ${brandName} understands the real friction they face.`,
        frequency: "2 posts/week",
      },
      {
        pillar: "Proof & Results",
        format: "Testimonials, before-after stories, metric-led posts",
        message: `Turn ${form.mainGoal.toLowerCase()} into believable proof points.`,
        frequency: "2 posts/week",
      },
      {
        pillar: "Product Walkthroughs",
        format: "Demo clips, annotated screenshots, feature deep-dives",
        message: `Make ${form.productService || "the offer"} feel easy to understand and adopt.`,
        frequency: "2 posts/week",
      },
      {
        pillar: "Offer & CTA Moments",
        format: "Promotional posts, reminders, stories, retargeting assets",
        message: "Ask for the next action directly once trust has been built.",
        frequency: "1-2 posts/week",
      },
      {
        pillar: "Founder / Team Perspective",
        format: "POV posts, BTS clips, team notes, AMA prompts",
        message: `Humanize ${brandName} and build consistency around the brand voice.`,
        frequency: "1 post/week",
      },
    ],
    postingSchedule: [
      {
        day: "Monday",
        primary: "Insight post tied to the top customer problem",
        secondary: "Short video with one practical takeaway",
      },
      {
        day: "Tuesday",
        primary: "Customer proof or testimonial highlight",
        secondary: "Comment reply or AMA thread",
      },
      {
        day: "Wednesday",
        primary: "Product walkthrough or feature demo",
        secondary: "Behind-the-scenes build moment",
      },
      {
        day: "Thursday",
        primary: "Comparison or myth-busting post",
        secondary: "UGC, partner, or community spotlight",
      },
      {
        day: "Friday",
        primary: "Offer post with strong CTA",
        secondary: "Founder takeaway or recap clip",
      },
      {
        day: "Saturday",
        primary: "Light engagement post or poll",
        secondary: "Repurpose the best performer into a new format",
      },
      {
        day: "Sunday",
        primary: "Rest / moderation / planning",
        secondary: "Rest / moderation / planning",
      },
    ],
    closingNote: `${brandName} can use ${primaryPlatform} and ${secondaryPlatform} to move from awareness into ${form.mainGoal.toLowerCase()}, while keeping the message simple enough for repeated execution. With a ${budgetLabel} budget, the smartest path is proof-led organic storytelling supported by selective promotion on the strongest-performing posts.`,
    nextSteps: [
      "Approve the audience, core offer, and one campaign promise.",
      "Draft the first seven posts and match each one to a KPI.",
      "Prepare landing-page and tracking links before promotion starts.",
      "Review week-one performance and double down on the strongest format.",
    ],
  };
}

export function MarketPlannerPanel({
  campaign,
  brand,
  brandAudience,
}: {
  campaign: CampaignOut;
  brand: BrandOut | null;
  brandAudience: string | null;
}) {
  const initialForm = useMemo<PlannerFormState>(
    () => ({
      brandName: brand?.brand_name?.trim() || "SHAHD",
      targetAudience: brandAudience?.trim() || "People who want to travel",
      industry: brand?.industry?.trim() || "Travel agency",
      budget: 1000,
      productService:
        campaign.description?.trim() || "Travel planning and destination packages",
      mainGoal: "Increase Sales",
      platforms: ["Instagram", "TikTok"],
    }),
    [brand, brandAudience, campaign.description],
  );

  const [form, setForm] = useState<PlannerFormState>(initialForm);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(
    () => buildGeneratedPlan(initialForm),
  );

  useEffect(() => {
    setForm(initialForm);
    setGeneratedPlan(buildGeneratedPlan(initialForm));
  }, [initialForm]);

  const togglePlatform = (platform: string) => {
    setForm((current) => {
      const exists = current.platforms.includes(platform);
      const platforms = exists
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform];

      return {
        ...current,
        platforms: platforms.length ? platforms : [platform],
      };
    });
  };

  const primaryPlatform = form.platforms[0] ?? "Instagram";
  const secondaryPlatform = form.platforms[1] ?? form.platforms[0] ?? "TikTok";

  return (
    <div className="space-y-5">
      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className={`${PANEL_CLASS} p-5`}>
          <div className="flex items-center gap-2 text-neonBlue">
            <Sparkles className="size-5" />
            <h2 className="text-2xl font-semibold">Market Planner</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Shape the business context, generate a ready-to-use content strategy,
            and review a weekly posting rhythm before the rest of the agents
            start producing assets.
          </p>

          <div className="grid gap-4 mt-5 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-white/70">Brand Name</span>
              <Input
                value={form.brandName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    brandName: event.target.value,
                  }))
                }
                className="bg-white border-white/10 text-cosmic"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/70">Target Audience</span>
              <Input
                value={form.targetAudience}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetAudience: event.target.value,
                  }))
                }
                className="bg-white border-white/10 text-cosmic"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/70">Industry</span>
              <Input
                value={form.industry}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    industry: event.target.value,
                  }))
                }
                className="bg-white border-white/10 text-cosmic"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/70">Marketing Budget ($)</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 px-3 text-white hover:bg-white/10"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      budget: Math.max(0, current.budget - 100),
                    }))
                  }
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={form.budget}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      budget: Number(event.target.value) || 0,
                    }))
                  }
                  className="bg-white border-white/10 text-cosmic"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 px-3 text-white hover:bg-white/10"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      budget: current.budget + 100,
                    }))
                  }
                >
                  +
                </Button>
              </div>
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm text-white/70">Product / Service</span>
              <Textarea
                rows={3}
                value={form.productService}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    productService: event.target.value,
                  }))
                }
                className="resize-none bg-white border-white/10 text-cosmic"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/70">Main Goal</span>
              <select
                value={form.mainGoal}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mainGoal: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-md border border-white/10 bg-white px-3 text-sm text-cosmic outline-none"
              >
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm text-white/70">Marketing Platforms</span>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const isActive = form.platforms.includes(platform);

                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        isActive
                          ? "border-neonPink/40 bg-neonPink/20 text-white"
                          : "border-white/15 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="bg-neonBlue text-cosmic hover:bg-neonBlue/90"
              onClick={() => setGeneratedPlan(buildGeneratedPlan(form))}
            >
              Generate Marketing Strategy
            </Button>
            {generatedPlan ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="size-4" />
                Marketing strategy generated
              </span>
            ) : null}
          </div>
        </div>

        <section className={`${PANEL_CLASS} p-5`}>
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Planner snapshot
          </p>
          <div className="grid gap-3 mt-4">
            <BriefStat label="Primary platform" value={primaryPlatform} />
            <BriefStat label="Secondary platform" value={secondaryPlatform} />
            <BriefStat
              label="Budget"
              value={`$${form.budget.toLocaleString("en-US")}`}
            />
            <BriefStat label="Main goal" value={form.mainGoal} />
          </div>
          <div className={`mt-4 p-4 ${SUBPANEL_CLASS}`}>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Planner angle
            </p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Use this workspace to turn a campaign brief into a social-first
              planning document with content pillars, a weekly cadence, and the
              next operational steps for launch.
            </p>
          </div>
        </section>
      </section>

      {generatedPlan ? (
        <>
          <section className={`${PANEL_CLASS} p-5`}>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Business Information
            </p>
            <div className="grid gap-3 mt-4 md:grid-cols-2 xl:grid-cols-3">
              <BriefStat label="Brand Name" value={form.brandName || "-"} />
              <BriefStat
                label="Target Audience"
                value={form.targetAudience || "-"}
              />
              <BriefStat label="Industry" value={form.industry || "-"} />
              <BriefStat
                label="Marketing Budget"
                value={`$${form.budget.toLocaleString("en-US")}`}
              />
              <BriefStat label="Main Goal" value={form.mainGoal || "-"} />
              <BriefStat
                label="Platforms"
                value={form.platforms.join(", ") || "-"}
              />
            </div>
            <div className={`mt-4 p-4 ${SUBPANEL_CLASS}`}>
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                Product / Service
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {form.productService || "No product or service summary yet."}
              </p>
            </div>
          </section>

          <section className={`${PANEL_CLASS} p-5`}>
            <h3 className="text-2xl font-semibold">Content Strategy</h3>
            <p className="mt-2 text-sm text-white/65">
              Content pillars across the selected platforms.
            </p>
            <div className={`mt-4 overflow-hidden ${SUBPANEL_CLASS}`}>
              <Table className="min-w-[760px] text-white">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="px-4 text-white/55">Pillar</TableHead>
                    <TableHead className="px-4 text-white/55">Format</TableHead>
                    <TableHead className="px-4 text-white/55">
                      Core Message
                    </TableHead>
                    <TableHead className="px-4 text-white/55">
                      Frequency
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedPlan.contentPillars.map((pillar) => (
                    <TableRow
                      key={pillar.pillar}
                      className="border-white/10 hover:bg-white/[0.03]"
                    >
                      <TableCell className="px-4 font-medium text-white/90">
                        {pillar.pillar}
                      </TableCell>
                      <TableCell className="px-4 text-white/70">
                        {pillar.format}
                      </TableCell>
                      <TableCell className="px-4 text-white/70">
                        {pillar.message}
                      </TableCell>
                      <TableCell className="px-4 text-white/70">
                        {pillar.frequency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className={`${PANEL_CLASS} p-5`}>
            <h3 className="text-2xl font-semibold">Recommended Posting Schedule</h3>
            <p className="mt-2 text-sm text-white/65">
              Keep every post connected to a CTA or a community action.
            </p>
            <div className={`mt-4 overflow-hidden ${SUBPANEL_CLASS}`}>
              <Table className="min-w-[680px] text-white">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="px-4 text-white/55">Day</TableHead>
                    <TableHead className="px-4 text-white/55">
                      {primaryPlatform}
                    </TableHead>
                    <TableHead className="px-4 text-white/55">
                      {secondaryPlatform}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedPlan.postingSchedule.map((row) => (
                    <TableRow
                      key={row.day}
                      className="border-white/10 hover:bg-white/[0.03]"
                    >
                      <TableCell className="px-4 font-medium text-white/90">
                        {row.day}
                      </TableCell>
                      <TableCell className="px-4 text-white/70">
                        {row.primary}
                      </TableCell>
                      <TableCell className="px-4 text-white/70">
                        {row.secondary}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className={`${PANEL_CLASS} p-5`}>
            <h3 className="text-xl font-semibold">Closing Note</h3>
            <p className="mt-3 text-sm leading-7 text-white/75">
              {generatedPlan.closingNote}
            </p>
            <div className={`mt-5 p-4 ${SUBPANEL_CLASS}`}>
              <p className="text-sm font-semibold text-white">Next Steps</p>
              <ol className="mt-3 space-y-2 text-sm text-white/75">
                {generatedPlan.nextSteps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
