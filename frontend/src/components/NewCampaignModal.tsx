import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createBrand, getBrands } from "../services/brandService";
import { createCampaign } from "../services/campaignService";
import type { BrandOut, CampaignOut } from "../types/api";
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

type Props = {
  open: boolean;
  mode: "campaign" | "brand";
  onOpenChange: (open: boolean) => void;
  onCreated: (campaign: CampaignOut) => void;
};

export function NewCampaignModal({
  open,
  mode,
  onOpenChange,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState<string>("");
  const [launchDate, setLaunchDate] = useState("");
  const [brands, setBrands] = useState<BrandOut[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [showBrandCreator, setShowBrandCreator] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandIndustry, setBrandIndustry] = useState("");
  const [brandAudience, setBrandAudience] = useState("");
  const [brandValueProp, setBrandValueProp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setLoadingBrands(true);

    void getBrands()
      .then((loadedBrands) => {
        setBrands(loadedBrands);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Something went wrong");
      })
      .finally(() => setLoadingBrands(false));
  }, [open]);

  const isBrandMode = mode === "brand";

  const reset = () => {
    setName("");
    setDescription("");
    setBrandId("");
    setLaunchDate("");
    setBrandName("");
    setBrandIndustry("");
    setBrandAudience("");
    setBrandValueProp("");
    setShowBrandCreator(false);
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleCreateBrand = async () => {
    setError(null);

    if (!brandName.trim()) {
      setError("Brand name is required before you can create a campaign.");
      return;
    }

    setCreatingBrand(true);
    try {
      const createdBrand = await createBrand({
        brand_name: brandName.trim(),
        industry: brandIndustry.trim() || null,
        target_audience: brandAudience.trim() || null,
        value_proposition: brandValueProp.trim() || null,
      });

      setBrands((current) => [...current, createdBrand]);
      setBrandId(String(createdBrand.id));
      setShowBrandCreator(false);
      toast.success("Brand created. You can continue with the campaign.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create brand.");
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    if (!brandId) {
      setError("Please create or select a brand first.");
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

  const shouldShowBrandCreator =
    !loadingBrands && (brands.length === 0 || showBrandCreator);

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#0D1018] p-6 text-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold">
                {isBrandMode ? "Create New Brand" : "Create New Campaign"}
              </Dialog.Title>
              <p className="text-sm text-white/60">
                {isBrandMode
                  ? "Create a brand profile for your workspace."
                  : "Start with a campaign name, then connect it to a brand."}
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 rounded-md text-white/50 hover:bg-white/10 hover:text-white"
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
                className="bg-white border-white/10 text-cosmic"
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
                className="bg-white resize-none border-white/10 text-cosmic"
                placeholder="What is this campaign about?"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Brand</Label>
              {loadingBrands ? (
                <p className="text-sm text-white/50">Loading brands...</p>
              ) : brands.length > 0 ? (
                <div className="space-y-3">
                  <Select
                    value={brandId || undefined}
                    onValueChange={setBrandId}
                    required
                  >
                    <SelectTrigger className="bg-white border-white/10 text-cosmic">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#141826] text-white">
                      {brands.map((b) => (
                        <SelectItem
                          key={b.id}
                          value={String(b.id)}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {b.brand_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!showBrandCreator ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowBrandCreator(true)}
                      className="w-full text-white bg-transparent border-white/20 hover:bg-white/10"
                    >
                      <Plus className="mr-2 size-4" />
                      Add New Brand
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {shouldShowBrandCreator ? (
              <div className="p-4 space-y-4 border rounded-lg border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    {brands.length === 0
                      ? "No brands yet"
                      : "Create a new brand"}
                  </p>
                  <p className="text-sm text-white/60">
                    {brands.length === 0
                      ? "Create one here first, then this campaign can attach to it automatically."
                      : "Add another brand without leaving the campaign flow."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-name" className="text-white/80">
                    Brand Name
                  </Label>
                  <Input
                    id="brand-name"
                    value={brandName}
                    onChange={(ev) => setBrandName(ev.target.value)}
                    className="bg-white border-white/10 text-cosmic"
                    placeholder="e.g. Northstar AI"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-industry" className="text-white/80">
                    Industry <span className="text-white/40">(optional)</span>
                  </Label>
                  <Input
                    id="brand-industry"
                    value={brandIndustry}
                    onChange={(ev) => setBrandIndustry(ev.target.value)}
                    className="bg-white border-white/10 text-cosmic"
                    placeholder="e.g. SaaS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-audience" className="text-white/80">
                    Target Audience{" "}
                    <span className="text-white/40">(optional)</span>
                  </Label>
                  <Textarea
                    id="brand-audience"
                    value={brandAudience}
                    onChange={(ev) => setBrandAudience(ev.target.value)}
                    rows={2}
                    className="bg-white resize-none border-white/10 text-cosmic"
                    placeholder="Who are you trying to reach?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-value" className="text-white/80">
                    Value Proposition{" "}
                    <span className="text-white/40">(optional)</span>
                  </Label>
                  <Textarea
                    id="brand-value"
                    value={brandValueProp}
                    onChange={(ev) => setBrandValueProp(ev.target.value)}
                    rows={2}
                    className="bg-white resize-none border-white/10 text-cosmic"
                    placeholder="What makes this brand valuable?"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleCreateBrand}
                  disabled={creatingBrand}
                  className="w-full text-white bg-white/10 hover:bg-white/15"
                >
                  {creatingBrand ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating brand...
                    </>
                  ) : (
                    "Create Brand"
                  )}
                </Button>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="launch-date" className="text-white/80">
                Launch Date <span className="text-white/40">(optional)</span>
              </Label>
              <Input
                id="launch-date"
                type="date"
                value={launchDate}
                onChange={(ev) => setLaunchDate(ev.target.value)}
                className="bg-white border-white/10 text-cosmic"
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
                className="text-white bg-transparent border-white/20 hover:bg-white/10"
                onClick={() => handleClose(false)}
                disabled={submitting || creatingBrand}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loadingBrands || creatingBrand}
                className="bg-neonBlue text-cosmic hover:bg-neonBlue/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
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
