import { ActionRow } from "../components/ActionRow";

export function VideoPanels({
  busyAction,
  onScript,
  onStoryboard,
  onCreatorBrief,
}: {
  busyAction: string | null;
  onScript: () => void;
  onStoryboard: () => void;
  onCreatorBrief: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Video Generation</h2>
        <p className="mt-3 text-sm text-white/70">
          Build short-form scripts, storyboard the proof arc, and prepare
          creator briefs around the selected campaign.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="grid gap-2 mt-4">
          <ActionRow
            label="Write short video script"
            loading={busyAction === "vscript"}
            onClick={onScript}
          />
          <button
            type="button"
            onClick={onStoryboard}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60"
          >
            Create storyboard
          </button>
          <ActionRow
            label="Plan creator brief"
            loading={busyAction === "vbrief"}
            onClick={onCreatorBrief}
          />
        </div>
      </section>
    </div>
  );
}