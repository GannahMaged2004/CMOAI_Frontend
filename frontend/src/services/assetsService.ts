import { request } from "../lib/api";
import type { MessageResponse } from "../types/api";

export interface AssetOut {
  id: number;
  name: string;
  asset_type: string;
  url: string;
  public_id: string | null;
  file_size: number | null;
  mime_type: string | null;
  campaign_id: number | null;
  created_at: string;
}

export async function listAssets(params?: {
  campaign_id?: number;
  asset_type?: string;
}): Promise<AssetOut[]> {
  const qs = new URLSearchParams();
  if (params?.campaign_id != null) {
    qs.set("campaign_id", String(params.campaign_id));
  }
  if (params?.asset_type) qs.set("asset_type", params.asset_type);
  const q = qs.toString();
  return request<AssetOut[]>(`/assets${q ? `?${q}` : ""}`);
}

export async function deleteAsset(id: number): Promise<MessageResponse> {
  return request<MessageResponse>(`/assets/${id}`, { method: "DELETE" });
}
