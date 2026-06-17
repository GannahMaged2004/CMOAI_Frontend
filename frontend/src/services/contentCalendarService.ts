import { request } from "../lib/api";
import type {
  ContentCalendarMap,
  ContentItemCreatePayload,
  ContentItemOut,
  MessageResponse,
  ScheduleCreatePayload,
  ScheduleOut,
} from "../types/api";

/**
 * Backend mounts this router at `/content-calendar` (not `/content`).
 */
export async function getContentCalendar(params: {
  strategy_id: number;
  month: number;
  year: number;
}): Promise<ContentCalendarMap> {
  const qs = new URLSearchParams({
    strategy_id: String(params.strategy_id),
    month: String(params.month),
    year: String(params.year),
  });
  return request<ContentCalendarMap>(
    `/content-calendar/calendar?${qs.toString()}`
  );
}

export async function createSchedule(
  payload: ScheduleCreatePayload,
): Promise<ScheduleOut> {
  return request<ScheduleOut>("/content-calendar/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listSchedules(strategyId: number): Promise<ScheduleOut[]> {
  return request<ScheduleOut[]>(
    `/content-calendar/schedules?strategy_id=${strategyId}`,
  );
}

export async function deleteSchedule(scheduleId: number): Promise<MessageResponse> {
  return request<MessageResponse>(`/content-calendar/schedules/${scheduleId}`, {
    method: "DELETE",
  });
}

export async function createContentItem(
  payload: ContentItemCreatePayload,
): Promise<ContentItemOut> {
  return request<ContentItemOut>("/content-calendar/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
