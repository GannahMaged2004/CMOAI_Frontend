import type { AgentSuggestion } from "../types";

export function SuggestionList({
  suggestions,
  onSelect,
}: {
  suggestions: AgentSuggestion[];
  onSelect: (action: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">
        Suggestions
      </p>
      {suggestions.map((suggestion) => (
        <button
          key={`${suggestion.title}-${suggestion.action}`}
          type="button"
          onClick={() => onSelect(suggestion.action)}
          className="w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-left transition hover:border-neonBlue/60 hover:bg-white/[0.08]"
        >
          <p className="text-sm font-medium text-white">{suggestion.title}</p>
          <p className="mt-1 text-xs leading-5 text-white/55">
            {suggestion.description}
          </p>
        </button>
      ))}
    </div>
  );
}