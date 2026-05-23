import { Loader2, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { SuggestionList } from "../components/SuggestionList";
import type { Agent, AgentSuggestion, ChatMessage } from "../types";

export function TextRightAside({
  activeAgent,
  campaignName,
  messages,
  draft,
  onDraftChange,
  onSend,
  nextActions,
  suggestions,
  onTextLi,
  onTextEmail,
  onTextHooks,
  busyAction,
}: {
  activeAgent: Agent;
  campaignName: string;
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: (message?: string) => void;
  nextActions: string[];
  suggestions: AgentSuggestion[];
  onTextLi: () => void;
  onTextEmail: () => void;
  onTextHooks: () => void;
  busyAction: string | null;
}) {
  const Icon = activeAgent.icon;
  const isBusy =
    busyAction === "li" ||
    busyAction === "email" ||
    busyAction === "hooks" ||
    busyAction === "textchat";

  const runQuick = (label: string) => {
    if (label === "Write LinkedIn posts") onTextLi();
    if (label === "Draft email sequence") onTextEmail();
    if (label === "Create ad hooks") onTextHooks();
  };

  return (
    <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
      <div className="flex h-full min-h-[560px] flex-col">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-md size-10 bg-white/10">
              <Icon className={`size-5 ${activeAgent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {activeAgent.name}
              </p>
              <p className="text-xs truncate text-white/45">{campaignName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          <SuggestionList suggestions={suggestions} onSelect={onSend} />
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-md px-3 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-8 bg-neonBlue text-cosmic"
                  : "mr-8 bg-white/[0.07] text-white/80"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          ))}
          {isBusy ? (
            <p className="flex items-center gap-2 text-xs text-white/50">
              <Loader2 className="size-3 animate-spin" /> Generating...
            </p>
          ) : null}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="grid gap-2 mb-3">
            {nextActions.map((action) => (
              <button
                key={action}
                type="button"
                disabled={isBusy}
                onClick={() => runQuick(action)}
                className="px-3 py-2 text-xs text-left transition border rounded-md border-white/10 text-white/70 hover:border-neonBlue/60 hover:text-white disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
          >
            <Input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              disabled={isBusy}
              placeholder="Ask Text"
              className="bg-white h-11 border-white/10 text-cosmic placeholder:text-slate-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isBusy || !draft.trim()}
              className="text-white h-11 w-11 bg-neonPink hover:bg-neonPink/90"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
