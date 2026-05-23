import { ActionRow } from "../components/ActionRow";

export function ImagePanels({
  busyAction,
  onPrompt,
  onAssets,
  onReview,
}: {
  busyAction: string | null;
  onPrompt: () => void;
  onAssets: () => void;
  onReview: () => void;
}) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-2xl font-semibold">Image Generation</h2>
        <p className="mt-3 text-sm text-white/70">
          Create real image prompts and campaign asset briefs, then use the demo
          review to check whether the creative direction stays consistent.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">
          Current focus
        </p>
        <div className="grid gap-2 mt-4">
          <ActionRow
            label="Create image prompts"
            loading={busyAction === "imgp"}
            onClick={onPrompt}
          />
          <ActionRow
            label="Draft asset briefs"
            loading={busyAction === "assets"}
            onClick={onAssets}
          />
          <button
            type="button"
            onClick={onReview}
            className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60"
          >
            Review visual consistency
          </button>
        </div>
      </section>
    </div>
  );
}