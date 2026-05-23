import { Button } from "../../../components/ui/button";

type DeleteConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmDialog({
  open,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111421] p-5 text-white shadow-2xl">
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="text-white border border-white/10 bg-white/10 hover:bg-white/15"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="text-white bg-red-500 hover:bg-red-400"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}