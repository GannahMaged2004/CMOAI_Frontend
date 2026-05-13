import { request } from "../lib/api";
import type {
  BlogPostRequest,
  GenerateImageRequest,
  QuickActionResponse,
} from "../types/api";

export async function quickActionBlogPost(
  body: BlogPostRequest
): Promise<QuickActionResponse> {
  return request<QuickActionResponse>("/quick-actions/blog-post", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function quickActionImagePrompt(
  body: GenerateImageRequest
): Promise<QuickActionResponse> {
  return request<QuickActionResponse>("/quick-actions/image-prompt", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
