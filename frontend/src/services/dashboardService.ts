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

export async function getDashboardUpcoming(): Promise<UpcomingContentItem[]> {
  return request<UpcomingContentItem[]>("/dashboard/upcoming");
}

export async function getDashboardInsights(): Promise<AIInsight[]> {
  return request<AIInsight[]>("/dashboard/insights");
}

export async function getDashboardUsage(): Promise<PlanUsage> {
  return request<PlanUsage>("/dashboard/usage");
}
