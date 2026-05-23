import { Button } from "../../../components/ui/button";
import { PANEL_CLASS } from "../constants";

export function ResultDialog({
  open,
  title,
  body,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  body: string;
  onOpenChange: (v: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-dialog-title"
    >
      <div
        className={`max-h-[80vh] w-full max-w-lg overflow-hidden ${PANEL_CLASS}`}
      >
        <div className="px-4 py-3 border-b border-white/10">
          <h2 id="result-dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
        </div>
        <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-white/85">
          {body}
        </pre>
        <div className="p-3 text-right border-t border-white/10">
          <Button
            type="button"
            className="bg-neonBlue text-cosmic hover:bg-neonBlue/90"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}