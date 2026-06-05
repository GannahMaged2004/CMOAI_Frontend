import { Loader2, Send } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { VideoAgentResponse } from "../../../types/api";
import { VideoAgentResultBody } from "../components/VideoAgentResultBody";
import { SuggestionList } from "../components/SuggestionList";
import type { Agent, AgentSuggestion, ChatMessage } from "../types";

export function VideoRightAside({
  activeAgent,
  campaignName,
  messages,
  lastResult,
  draft,
  onDraftChange,
  onSend,
  suggestions,
  onScript,
  onStoryboard,
  onCreatorBrief,
  busyAction,
}: {
  activeAgent: Agent;
  campaignName: string;
  messages: ChatMessage[];
  lastResult: VideoAgentResponse | null;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: (message?: string) => void;
  suggestions: AgentSuggestion[];
  onScript: () => void;
  onStoryboard: () => void;
  onCreatorBrief: () => void;
  busyAction: string | null;
}) {
  const Icon = activeAgent.icon;
  const isBusy =
    busyAction === "vscript" ||
    busyAction === "vstoryboard" ||
    busyAction === "vbrief" ||
    busyAction === "videochat";

  const runQuick = (label: string) => {
    if (label === "Write short video script") onScript();
    if (label === "Create storyboard") onStoryboard();
    if (label === "Plan creator brief") onCreatorBrief();
  };

  return (
    <aside className="border-t border-white/10 bg-[#0D1018] xl:border-l xl:border-t-0">
      <div className="flex h-full min-h-[560px] flex-col">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-white/10">
              <Icon className={`size-5 ${activeAgent.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeAgent.name}</p>
              <p className="truncate text-xs text-white/45">{campaignName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            </div>
          ))}
          {lastResult && !isBusy ? (
            <div className="mr-4 rounded-md border border-white/10 bg-[#090A0F] p-3">
              <VideoAgentResultBody result={lastResult} />
            </div>
          ) : null}
          {isBusy ? (
            <p className="flex items-center gap-2 text-xs text-white/50">
              <Loader2 className="size-3 animate-spin" />
              Generating video plan… this may take several minutes.
            </p>
          ) : null}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 grid gap-2">
            {[
              "Write short video script",
              "Create storyboard",
              "Plan creator brief",
            ].map((action) => (
              <button
                key={action}
                type="button"
                disabled={isBusy}
                onClick={() => runQuick(action)}
                className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-white/70 transition hover:border-neonBlue/60 hover:text-white disabled:opacity-50"
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
              placeholder="Ask Video"
              className="h-11 border-white/10 bg-white text-cosmic placeholder:text-slate-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isBusy || !draft.trim()}
              className="h-11 w-11 bg-neonPink text-white hover:bg-neonPink/90"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
