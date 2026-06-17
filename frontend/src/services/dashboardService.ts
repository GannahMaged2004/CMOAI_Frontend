import { request } from "../lib/api";
import type {
  AIInsight,
  DashboardSummary,
  PlanUsage,
  UpcomingContentItem,
} from "../types/api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/dashboard/summary");
}

export async function getDashboardUpcoming(params?: {
  campaign_id?: number;
}): Promise<UpcomingContentItem[]> {
  const qs = new URLSearchParams();
  if (params?.campaign_id) qs.set("campaign_id", String(params.campaign_id));
  const q = qs.toString();
  return request<UpcomingContentItem[]>(`/dashboard/upcoming${q ? `?${q}` : ""}`);
}

export async function getDashboardInsights(): Promise<AIInsight[]> {
  return request<AIInsight[]>("/dashboard/insights");
}

export async function getDashboardUsage(): Promise<PlanUsage> {
  return request<PlanUsage>("/dashboard/usage");
}
