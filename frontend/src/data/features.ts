// src/data/features.ts
import {
  Sparkles,
  Calendar,
  BarChart3,
  PenTool,
  Target,
  Rocket,
} from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  why: string;
  actions: string[];
  useCase: string;
  connection: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  shadow: string;
}

export const features: Feature[] = [
  {
    id: "brand-coaching",
    title: "Brand Coaching",
    description:
      "Define a clear voice, tone, and positioning across all channels.",
    why:
      "Many startups publish content without a defined identity, leading to inconsistent messaging and weak audience trust.",
    actions: [
      "Define your brand voice",
      "Generate tone suggestions",
      "Clarify product positioning",
      "Keep messaging consistent",
    ],
    useCase:
      "A founder launching a new product can define how their brand should sound before creating campaigns.",
    connection:
      "This feature builds the foundation for all other features like content and campaigns.",
    icon: Sparkles,
    color: "text-neonPurple",
    bg: "bg-neonPurple/5",
    shadow: "hover:shadow-neonPurple",
  },

  {
    id: "market-planning",
    title: "Market Planning",
    description:
      "Build structured, data-informed strategies tailored to your audience.",
    why:
      "Teams often rely on guesswork instead of structured planning, leading to wasted effort.",
    actions: [
      "Define target audience",
      "Generate strategies",
      "Identify opportunities",
      "Align campaigns with goals",
    ],
    useCase:
      "Teams can plan campaigns with clear direction instead of random execution.",
    connection:
      "Guides content generation and campaign execution.",
    icon: Target,
    color: "text-neonBlue",
    bg: "bg-neonBlue/5",
    shadow: "hover:shadow-neonBlue",
  },

  {
    id: "smart-calendar",
    title: "Smart Calendar",
    description:
      "Organize and automate your content schedule intelligently.",
    why:
      "Manual planning is time-consuming and inconsistent.",
    actions: [
      "Generate content schedules",
      "Optimize posting times",
      "Organize campaigns",
      "Stay consistent",
    ],
    useCase:
      "A team can plan a full month of content in minutes.",
    connection:
      "Turns strategy into execution and connects with analytics.",
    icon: Calendar,
    color: "text-neonGreen",
    bg: "bg-neonGreen/5",
    shadow: "hover:shadow-neonGreen",
  },

  {
    id: "content-generation",
    title: "Content Generation",
    description:
      "Create blogs, posts, and campaigns instantly.",
    why:
      "Content creation is a major bottleneck for most teams.",
    actions: [
      "Generate posts",
      "Create blogs",
      "Produce campaigns",
      "Adapt content",
    ],
    useCase:
      "Users generate drafts instantly instead of writing from scratch.",
    connection:
      "Executes strategy and feeds into scheduling.",
    icon: PenTool,
    color: "text-neonPink",
    bg: "bg-neonPink/5",
    shadow: "hover:shadow-neonPink",
  },

  {
    id: "analytics",
    title: "Performance Analytics",
    description:
      "Track KPIs and improve decisions with insights.",
    why:
      "Without analytics, teams cannot improve performance effectively.",
    actions: [
      "Track engagement",
      "Identify trends",
      "Get insights",
      "Optimize campaigns",
    ],
    useCase:
      "Teams can quickly adjust campaigns based on real data.",
    connection:
      "Closes the loop and improves all other features.",
    icon: BarChart3,
    color: "text-neonYellow",
    bg: "bg-neonYellow/5",
    shadow: "hover:shadow-neonYellow",
  },

  {
    id: "campaign-management",
    title: "Campaign Management",
    description:
      "Manage all campaigns in one centralized system.",
    why:
      "Multiple tools create confusion and reduce visibility.",
    actions: [
      "Create campaigns",
      "Track progress",
      "Manage content",
      "Monitor performance",
    ],
    useCase:
      "Teams manage everything from one dashboard instead of multiple tools.",
    connection:
      "Brings together all features into one workflow.",
    icon: Rocket,
    color: "text-neonRed",
    bg: "bg-neonRed/5",
    shadow: "hover:shadow-neonRed",
  },
];