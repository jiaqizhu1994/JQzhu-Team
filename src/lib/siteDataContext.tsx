"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { siteData as baseSiteData } from "@/data/site";
import { GlobalImagePreview } from "@/components/GlobalImagePreview";
import { normalizeSiteData } from "@/lib/siteDataDefaults";
import { prefixPublicAssetPaths } from "@/lib/publicPath";

export type SiteData = typeof baseSiteData;

export const SITE_DATA_STORAGE_KEY = "academic-homepage-site-data";

type SiteDataContextValue = {
  data: SiteData;
  saveData: (nextData: SiteData) => Promise<void>;
  isReady: boolean;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

async function readServerData(): Promise<SiteData | null> {
  try {
    const response = await fetch("/api/site-data", { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    return prefixPublicAssetPaths(normalizeSiteData(await response.json()));
  } catch {
    return null;
  }
}

export function SiteDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: SiteData;
}) {
  const [data, setData] = useState<SiteData>(initialData);

  const saveData = useCallback(async (nextData: SiteData) => {
    const normalizedData = normalizeSiteData(nextData);

    const response = await fetch("/api/site-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedData),
    });
    if (!response.ok) {
      throw new Error("网站内容保存失败");
    }
    window.localStorage.setItem(
      SITE_DATA_STORAGE_KEY,
      JSON.stringify(normalizedData),
    );
    setData(normalizedData);
    window.dispatchEvent(new Event("site-data-updated"));
  }, []);

  useEffect(() => {
    const syncData = async () => {
      const serverData = await readServerData();
      if (serverData) {
        setData(serverData);
      }
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("site-data-updated", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("site-data-updated", syncData);
    };
  }, []);

  const value = useMemo(
    () => ({ data, saveData, isReady: true }),
    [data, saveData],
  );

  return (
    <SiteDataContext.Provider value={value}>
      {children}
      <GlobalImagePreview />
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const value = useContext(SiteDataContext);

  if (!value) {
    throw new Error("useSiteData must be used inside SiteDataProvider");
  }

  return value;
}
