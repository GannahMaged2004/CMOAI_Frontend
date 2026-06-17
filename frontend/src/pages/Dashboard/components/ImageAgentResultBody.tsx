import type { ImageAgentResponse } from "../../../types/api";
import { resolveUploadUrl } from "../utils";

export function ImageAgentResultBody({
  result,
}: {
  result: ImageAgentResponse;
}) {
  const fallbackNote = result.images.find(
    (img) => typeof img.metadata?.fallback_reason === "string",
  )?.metadata?.fallback_reason;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
        <span>{result.brand_name}</span>
        <span>·</span>
        <span>{result.generation_time_sec}s</span>
        {result.ab_test_ready ? (
          <span className="rounded-full border border-neonBlue/40 px-2 py-0.5 text-neonBlue">
            A/B ready
          </span>
        ) : null}
      </div>

      {result.images[0]?.ad_copy ? (
        <p className="text-sm font-medium text-white/90">
          {result.images[0].ad_copy}
        </p>
      ) : null}

      {typeof fallbackNote === "string" && fallbackNote ? (
        <div className="rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
          {fallbackNote}
        </div>
      ) : null}

      <div
        className={
          result.images.length > 1
            ? "grid gap-3 sm:grid-cols-2"
            : "grid gap-3"
        }
      >
        {result.images.map((img) => (
          <div
            key={img.image_id}
            className="overflow-hidden rounded-md border border-white/10 bg-[#090A0F]"
          >
            <img
              src={resolveUploadUrl(img.image_url)}
              alt={img.ad_copy || img.image_id}
              className="aspect-square w-full object-cover"
            />
            <div className="space-y-1 p-3 text-xs text-white/60">
              <p className="text-white/80">
                {img.platform} · {img.size}
                {img.logo_applied ? " · logo" : ""}
              </p>
              <p className="line-clamp-3">{img.prompt_used}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
