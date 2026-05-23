import { Loader2 } from "lucide-react";

export function ActionRow({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="rounded-md border border-white/10 bg-[#0D1018] px-3 py-2 text-left text-sm text-white/80 transition hover:border-neonBlue/60 disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </span>
      ) : (
        label
      )}
    </button>
  );
}