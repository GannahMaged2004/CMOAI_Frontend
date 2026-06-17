import { request } from "../lib/api";
import type {
  BrandAgentRequest,
  BrandAgentResponse,
  BrandAgentStatus,
} from "../types/api";

export async function getBrandAgentStatus(): Promise<BrandAgentStatus> {
  return request<BrandAgentStatus>("/agents/brand/status", {
    method: "GET",
  });
}

export async function generateBrandGuidance(
  data: BrandAgentRequest,
): Promise<BrandAgentResponse> {
  return request<BrandAgentResponse>("/agents/brand/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
