import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const uploadPublicPrefix = "/uploads/";
const uploadDir = path.join(process.cwd(), "public", "uploads");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isCompleteSiteData(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.nav) &&
    isRecord(value.sectionTitles) &&
    isRecord(value.sectionEyebrows) &&
    isRecord(value.sectionSubtitles) &&
    isRecord(value.aboutContentTitles) &&
    isRecord(value.teamGroupTitles) &&
    isRecord(value.profile) &&
    Array.isArray(value.stats) &&
    Array.isArray(value.timeline) &&
    Array.isArray(value.researchAreas) &&
    Array.isArray(value.news) &&
    Array.isArray(value.publications) &&
    Array.isArray(value.projects) &&
    isRecord(value.members) &&
    Array.isArray(value.activities) &&
    isRecord(value.joinUs) &&
    Array.isArray(value.joinUs.images) &&
    Array.isArray(value.alumni) &&
    isRecord(value.contact) &&
    Array.isArray(value.contact.links) &&
    Array.isArray(value.contact.mapImages)
  );
}

function collectUploadPaths(value: unknown, usedPaths = new Set<string>()) {
  if (typeof value === "string") {
    if (value.startsWith(uploadPublicPrefix)) {
      usedPaths.add(value);
    }

    return usedPaths;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectUploadPaths(item, usedPaths));
    return usedPaths;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectUploadPaths(item, usedPaths));
  }

  return usedPaths;
}

export async function cleanupUnusedUploads(data: unknown) {
  if (!isCompleteSiteData(data)) {
    return { deleted: [], skipped: true };
  }

  const usedPaths = collectUploadPaths(data);
  const deleted: string[] = [];

  let files: string[];
  try {
    files = await readdir(uploadDir);
  } catch {
    return { deleted, skipped: false };
  }

  await Promise.all(
    files.map(async (fileName) => {
      if (fileName === ".gitkeep") {
        return;
      }

      const publicPath = `${uploadPublicPrefix}${fileName}`;

      if (usedPaths.has(publicPath)) {
        return;
      }

      await rm(path.join(uploadDir, fileName), { force: true });
      deleted.push(publicPath);
    }),
  );

  return { deleted, skipped: false };
}
