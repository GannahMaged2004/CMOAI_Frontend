export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface MemberOut {
  user_id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  joined_at: string;
}

export interface TeamOut {
  id: number;
  name: string;
  owner_id: number;
  members: MemberOut[];
  created_at: string;
}

export interface BrandOut {
  id: number;
  brand_name: string;
  industry: string | null;
  tone_of_voice: string | null;
  target_audience: string | null;
  value_proposition: string | null;
  positioning: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface StrategyOut {
  id: number;
  title: string;
  objectives: string | null;
  messaging_themes: string | null;
  platform_focus: string | null;
  status: string;
  brand_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface MessageResponse {
  message: string;
}

/** Matches backend `CampaignStatus` serialization */
export type CampaignStatusApi = "Draft" | "In Progress" | "Completed";

export interface CampaignOut {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  brand_id: number;
  strategy_id: number | null;
  status: CampaignStatusApi;
  created_at: string;
  updated_at: string | null;
}

export interface CampaignCreatePayload {
  name: string;
  description?: string | null;
  brand_id: number;
  strategy_id?: number | null;
  start_date?: string | null;
}

export interface DashboardSummary {
  active_campaigns: number;
  total_reach: number;
  avg_engagement_rate: number;
  scheduled_posts: number;
}

export interface UpcomingContentItem {
  title: string;
  platform: string;
  scheduled_date: string;
  status: string;
}

export interface AIInsight {
  tip: string;
  action: string;
}

export interface PlanUsage {
  plan_name: string;
  ai_generations_used: number;
  ai_generation_limit: number;
}

export interface AnalyticsOverview {
  total_impressions: number;
  total_engagement: number;
  total_clicks: number;
  total_conversions: number;
  total_reach: number;
  avg_engagement_rate: number;
}

export interface ChannelBreakdown {
  platform: string;
  total_reach: number;
  total_engagement: number;
  total_clicks: number;
}

export interface TimeSeriesPoint {
  date: string;
  reach: number;
  engagement: number;
}

export type ContentCalendarMap = Record<string, ContentItemOut[]>;

export interface ContentItemOut {
  id: number;
  title: string;
  content_type: string;
  platform: string;
  objective: string | null;
  body_text: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  status: string;
  schedule_id: number;
  created_at: string;
}

export interface QuickActionResponse {
  result: string;
}

export interface BlogPostRequest {
  topic: string;
  brand_id: number;
}

export interface GenerateImageRequest {
  prompt: string;
  brand_id: number;
}
