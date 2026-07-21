import os from "node:os";

const isGitHubPagesExport = process.env.GITHUB_PAGES_EXPORT === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const inferredBasePath =
  repositoryName && !repositoryName.endsWith(".github.io")
    ? `/${repositoryName}`
    : "";
const pagesBasePath = isGitHubPagesExport
  ? process.env.GITHUB_PAGES_BASE_PATH ?? inferredBasePath
  : "";

process.env.NEXT_PUBLIC_STATIC_EXPORT = isGitHubPagesExport ? "true" : "false";
process.env.NEXT_PUBLIC_BASE_PATH = pagesBasePath;

const configuredDevOrigins = (process.env.LAN_DEV_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localIpv4Origins = Object.values(os.networkInterfaces())
  .flatMap((addresses) => addresses || [])
  .filter((address) => address.family === "IPv4" && !address.internal)
  .map((address) => address.address);
const allowedDevOrigins = Array.from(
  new Set(["localhost", "127.0.0.1", ...localIpv4Origins, ...configuredDevOrigins]),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  ...(isGitHubPagesExport ? { output: "export", trailingSlash: true } : {}),
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath || undefined,
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGitHubPagesExport ? "true" : "false",
    NEXT_PUBLIC_BASE_PATH: pagesBasePath,
  },
  images: { unoptimized: isGitHubPagesExport },
};

export default nextConfig;
