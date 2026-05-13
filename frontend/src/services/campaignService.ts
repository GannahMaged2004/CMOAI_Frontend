import { request } from "../lib/api";
import type {
  CampaignCreatePayload,
  CampaignOut,
  MessageResponse,
} from "../types/api";

export async function listCampaigns(params?: {
  status?: string;
  search?: string;
}): Promise<CampaignOut[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  const q = qs.toString();
  return request<CampaignOut[]>(`/campaigns${q ? `?${q}` : ""}`);
}

export async function getCampaign(id: number): Promise<CampaignOut> {
  return request<CampaignOut>(`/campaigns/${id}`);
}

export async function createCampaign(
  body: CampaignCreatePayload
): Promise<CampaignOut> {
  return request<CampaignOut>("/campaigns", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCampaign(
  id: number,
  body: Partial<
    Pick<CampaignCreatePayload, "name" | "description" | "start_date">
  > & { strategy_id?: number | null }
): Promise<CampaignOut> {
  return request<CampaignOut>(`/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteCampaign(id: number): Promise<MessageResponse> {
  return request<MessageResponse>(`/campaigns/${id}`, { method: "DELETE" });
}
