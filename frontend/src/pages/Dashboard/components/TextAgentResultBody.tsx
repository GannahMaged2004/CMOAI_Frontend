import type { TextAgentResponse } from "../../../types/api";

export function TextAgentResultBody({ result }: { result: TextAgentResponse }) {
  return (
    <div className="space-y-3 whitespace-pre-wrap">
      {result.subject_line ? (
        <p>
          <span className="text-white/50">Subject: </span>
          {result.subject_line}
        </p>
      ) : null}
      <p>{result.generated_content}</p>
      {result.hashtags?.length ? (
        <p className="text-neonBlue">{result.hashtags.join(" ")}</p>
      ) : null}
      {result.variations?.map((v) => (
        <div
          key={v.variation_id}
          className="p-2 border rounded border-white/10"
        >
          <p className="text-xs text-white/45">Variation {v.variation_id}</p>
          <p className="mt-1">{v.content}</p>
        </div>
      ))}
      {result.char_count != null ? (
        <p className="text-xs text-white/45">{result.char_count} characters</p>
      ) : null}
    </div>
  );
}
