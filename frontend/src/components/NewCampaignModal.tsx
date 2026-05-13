import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { getBrands } from "../services/brandService";
import { createCampaign } from "../services/campaignService";
import type { BrandOut, CampaignOut } from "../types/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaign: CampaignOut) => void;
};

export function NewCampaignModal({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState<string>("");
  const [launchDate, setLaunchDate] = useState("");
  const [brands, setBrands] = useState<BrandOut[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoadingBrands(true);
    void getBrands()
      .then(setBrands)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Something went wrong");
      })
      .finally(() => setLoadingBrands(false));
  }, [open]);

  const reset = () => {
    setName("");
    setDescription("");
    setBrandId("");
    setLaunchDate("");
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Campaign name is required.");
      return;
    }
    if (!brandId) {
      setError("Please select a brand.");
      return;
    }
    setSubmitting(true);
    try {
      const start_date =
        launchDate.trim() === ""
          ? null
          : new Date(`${launchDate}T12:00:00`).toISOString();
      const campaign = await createCampaign({
        name: name.trim(),
        description: description.trim() || null,
        brand_id: Number.parseInt(brandId, 10),
        start_date,
      });
      toast.success("Campaign created successfully");
      onCreated(campaign);
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#0D1018] p-6 text-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold">
              Create New Campaign
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Create a new marketing campaign linked to a brand.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="text-white/80">
                Campaign Name
              </Label>
              <Input
                id="campaign-name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                required
                maxLength={200}
                className="border-white/10 bg-white text-cosmic"
                placeholder="e.g. Spring launch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-desc" className="text-white/80">
                Description{" "}
                <span className="text-white/40">(optional, max 500)</span>
              </Label>
              <Textarea
                id="campaign-desc"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                maxLength={500}
                rows={3}
                className="resize-none border-white/10 bg-white text-cosmic"
                placeholder="What is this campaign about?"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Brand</Label>
              {loadingBrands ? (
                <p className="text-sm text-white/50">Loading brands…</p>
              ) : (
                <Select
                  value={brandId || undefined}
                  onValueChange={setBrandId}
                  required
                >
                  <SelectTrigger className="border-white/10 bg-white text-cosmic">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.brand_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="launch-date" className="text-white/80">
                Launch Date <span className="text-white/40">(optional)</span>
              </Label>
              <Input
                id="launch-date"
                type="date"
                value={launchDate}
                onChange={(ev) => setLaunchDate(ev.target.value)}
                className="border-white/10 bg-white text-cosmic"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loadingBrands}
                className="bg-neonBlue text-cosmic hover:bg-neonBlue/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
