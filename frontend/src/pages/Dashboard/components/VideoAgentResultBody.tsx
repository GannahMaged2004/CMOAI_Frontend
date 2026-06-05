import type { VideoAgentResponse } from "../../../types/api";

export function VideoAgentResultBody({
  result,
}: {
  result: VideoAgentResponse;
}) {
  const plan = result.video_plan;
  const script = plan?.script;

  if (result.status === "error" && result.error_message) {
    return (
      <p className="text-sm text-red-300">{result.error_message}</p>
    );
  }

  return (
    <div className="space-y-4 text-sm text-white/85">
      {plan?.concept ? (
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Concept
          </p>
          <p className="mt-1">{plan.concept}</p>
        </div>
      ) : null}

      {script ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Script
          </p>
          {script.hook ? (
            <p>
              <span className="text-white/50">Hook: </span>
              {script.hook}
            </p>
          ) : null}
          {script.body ? (
            <p>
              <span className="text-white/50">Body: </span>
              {script.body}
            </p>
          ) : null}
          {script.cta ? (
            <p>
              <span className="text-white/50">Call to Action: </span>
              {script.cta}
            </p>
          ) : null}
        </div>
      ) : null}

      {plan?.scenes?.length ? (
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Scenes
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {plan.scenes.map((scene, i) => (
              <li key={`${i}-${scene.slice(0, 24)}`}>{scene}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {plan?.visual_style || plan?.audio_style ? (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Style guide
          </p>
          {plan.visual_style ? (
            <p>
              <span className="text-white/50">Visual: </span>
              {plan.visual_style}
            </p>
          ) : null}
          {plan.audio_style ? (
            <p>
              <span className="text-white/50">Audio: </span>
              {plan.audio_style}
            </p>
          ) : null}
        </div>
      ) : null}

      {result.reasoning?.why_this_works ? (
        <p className="text-xs text-white/55">
          {result.reasoning.why_this_works}
        </p>
      ) : null}

      {result.video_prompt ? (
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Video prompt
          </p>
          <pre className="mt-2 max-h-40 overflow-auto rounded border border-white/10 bg-black/40 p-2 text-xs whitespace-pre-wrap">
            {result.video_prompt}
          </pre>
        </div>
      ) : null}

      {result.video_url ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">
            Generated video
          </p>
          <video
            src={result.video_url}
            controls
            className="w-full rounded-md border border-white/10"
          />
        </div>
      ) : null}
    </div>
  );
}
