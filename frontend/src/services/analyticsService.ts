import { request } from "../lib/api";
import type {
  AnalyticsOverview,
  ChannelBreakdown,
  TimeSeriesPoint,
} from "../types/api";

export async function getAnalyticsOverview(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<AnalyticsOverview> {
  const qs = new URLSearchParams();
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);
  const q = qs.toString();
  return request<AnalyticsOverview>(`/analytics/overview${q ? `?${q}` : ""}`);
}

export async function getAnalyticsChannels(): Promise<ChannelBreakdown[]> {
  return request<ChannelBreakdown[]>("/analytics/channels");
}

export async function getAnalyticsChart(params: {
  start_date: string;
  end_date: string;
}): Promise<TimeSeriesPoint[]> {
  const qs = new URLSearchParams({
    start_date: params.start_date,
    end_date: params.end_date,
  });
  return request<TimeSeriesPoint[]>(`/analytics/chart?${qs}`);
}
