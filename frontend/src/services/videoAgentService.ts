import { request } from "../lib/api";
import type { VideoAgentRequest, VideoAgentResponse } from "../types/api";

export async function generateVideo(
  data: VideoAgentRequest
): Promise<VideoAgentResponse> {
  return request<VideoAgentResponse>("/agents/video/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
