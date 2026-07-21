import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SiteData } from "@/lib/siteDataContext";
import { normalizeSiteData } from "@/lib/siteDataDefaults";
import { prefixPublicAssetPaths } from "@/lib/publicPath";

const dataFile = path.join(process.cwd(), "content", "site-data.json");

export async function readRawSavedSiteData(): Promise<SiteData | null> {
  try {
    const raw = await readFile(dataFile, "utf-8");
    return normalizeSiteData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function readSavedSiteData(): Promise<SiteData | null> {
  const data = await readRawSavedSiteData();
  return data ? prefixPublicAssetPaths(data) : null;
}
