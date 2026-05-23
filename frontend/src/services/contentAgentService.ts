import { request } from "../lib/api";
import type {
  ContentAgentStatus,
  TextAgentRequest,
  TextAgentResponse,
} from "../types/api";

export async function getContentAgentStatus(): Promise<ContentAgentStatus> {
  return request<ContentAgentStatus>("/agents/content/status", {
    method: "GET",
  });
}

export async function generateContent(
  data: TextAgentRequest
): Promise<TextAgentResponse> {
  return request<TextAgentResponse>("/agents/content/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
