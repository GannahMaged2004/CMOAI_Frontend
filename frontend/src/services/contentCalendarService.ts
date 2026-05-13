import { request } from "../lib/api";
import type { ContentCalendarMap } from "../types/api";

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
