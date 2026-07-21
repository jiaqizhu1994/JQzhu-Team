const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export function withPublicBasePath(value: string) {
  if (value.startsWith("/uploads/") && !isStaticExport) {
    return `/api/media/${encodeURIComponent(value.slice("/uploads/".length))}`;
  }

  if (!basePath || (!value.startsWith("/images/") && !value.startsWith("/uploads/"))) {
    return value;
  }

  return `${basePath}${value}`;
}

export function prefixPublicAssetPaths<T>(value: T): T {
  if (typeof value === "string") {
    return withPublicBasePath(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => prefixPublicAssetPaths(item)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        prefixPublicAssetPaths(item),
      ]),
    ) as T;
  }
  return value;
}
