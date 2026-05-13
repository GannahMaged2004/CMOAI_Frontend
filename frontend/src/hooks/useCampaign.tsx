import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "../constants/storage";
import { getBrand } from "../services/brandService";
import { getCampaign, listCampaigns } from "../services/campaignService";
import type { CampaignOut } from "../types/api";

type CampaignContextValue = {
  campaigns: CampaignOut[];
  campaign: CampaignOut | null;
  campaignId: number | null;
  setCampaignId: (id: number) => void;
  /** Refetch campaign list + current campaign detail */
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  /** Target audience for active campaign's brand (or null) */
  brandAudience: string | null;
  /** Append a newly created campaign and select it */
  registerNewCampaign: (c: CampaignOut) => void;
};

const CampaignContext = createContext<CampaignContextValue | null>(null);

function readStoredCampaignId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CAMPAIGN_ID);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<CampaignOut[]>([]);
  const [campaignId, setCampaignIdState] = useState<number | null>(
    readStoredCampaignId
  );
  const [campaign, setCampaign] = useState<CampaignOut | null>(null);
  const [brandAudience, setBrandAudience] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setCampaignId = useCallback((id: number) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CAMPAIGN_ID, String(id));
    setCampaignIdState(id);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listCampaigns();
      setCampaigns(list);

      if (!list.length) {
        setCampaignIdState(null);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CAMPAIGN_ID);
        setCampaign(null);
        setBrandAudience(null);
        return;
      }

      const storedValid =
        campaignId != null && list.some((c) => c.id === campaignId);
      if (!storedValid) {
        setCampaignId(list[0].id);
        return;
      }

      const detail = await getCampaign(campaignId);
      setCampaign(detail);

      try {
        const brand = await getBrand(detail.brand_id);
        setBrandAudience(brand.target_audience ?? null);
      } catch {
        setBrandAudience(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      setCampaign(null);
      setBrandAudience(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, setCampaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  const registerNewCampaign = useCallback(
    (c: CampaignOut) => {
      setCampaigns((prev) => {
        if (prev.some((x) => x.id === c.id)) return prev;
        return [...prev, c];
      });
      setCampaign(c);
      setCampaignId(c.id);
    },
    [setCampaignId]
  );

  const value = useMemo<CampaignContextValue>(
    () => ({
      campaigns,
      campaign,
      campaignId,
      setCampaignId,
      refresh: load,
      isLoading,
      error,
      brandAudience,
      registerNewCampaign,
    }),
    [
      campaigns,
      campaign,
      campaignId,
      setCampaignId,
      load,
      isLoading,
      error,
      brandAudience,
      registerNewCampaign,
    ]
  );

  return (
    <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>
  );
}

export function useCampaign(): CampaignContextValue {
  const ctx = useContext(CampaignContext);
  if (!ctx) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return ctx;
}
