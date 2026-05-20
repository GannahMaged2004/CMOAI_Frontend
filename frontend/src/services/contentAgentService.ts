import { request } from "../lib/api";
import type { TextAgentRequest, TextAgentResponse } from "../types/api";

export async function generateContent(
  data: TextAgentRequest
): Promise<TextAgentResponse> {
  return request<TextAgentResponse>("/agents/content/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
