import { siteData as baseSiteData } from "@/data/site";

export type SiteDataWithDefaults = typeof baseSiteData;

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function normalizeImageCollection(primary: unknown, images: unknown) {
  const normalizedImages = Array.isArray(images)
    ? images.filter(
        (image): image is string =>
          typeof image === "string" && image.trim().length > 0,
      )
    : [];

  if (!normalizedImages.length && typeof primary === "string" && primary) {
    normalizedImages.push(primary);
  }

  return {
    image: normalizedImages[0] ?? (typeof primary === "string" ? primary : ""),
    images: normalizedImages,
  };
}

function normalizeNewsDate(value: unknown) {
  if (typeof value !== "string") return "";
  const date = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (/^\d{4}[.-]\d{2}$/.test(date)) {
    return `${date.replace(".", "-")}-01`;
  }
  if (/^\d{4}$/.test(date)) return `${date}-01-01`;

  return "";
}

function normalizeActivityDate(value: unknown) {
  return normalizeNewsDate(value);
}

export function normalizeSiteData(data: unknown): SiteDataWithDefaults {
  const base = cloneData(baseSiteData) as SiteDataWithDefaults & {
    profile: SiteDataWithDefaults["profile"] & { heroBadge?: string };
  };
  const incoming = cloneData((data ?? {}) as Partial<SiteDataWithDefaults>) as
    | (Partial<SiteDataWithDefaults> & {
        profile?: Partial<SiteDataWithDefaults["profile"]> & {
          heroBadge?: string;
        };
      })
    | undefined;

  const next = {
    ...base,
    ...incoming,
    sectionTitles: {
      ...base.sectionTitles,
      ...(incoming?.sectionTitles ?? {}),
    },
    sectionEyebrows: {
      ...base.sectionEyebrows,
      ...(incoming?.sectionEyebrows ?? {}),
    },
    sectionSubtitles: {
      ...base.sectionSubtitles,
      ...(incoming?.sectionSubtitles ?? {}),
    },
    aboutContentTitles: {
      ...base.aboutContentTitles,
      ...(incoming?.aboutContentTitles ?? {}),
    },
    teamGroupTitles: {
      ...base.teamGroupTitles,
      ...(incoming?.teamGroupTitles ?? {}),
    },
    contact: {
      ...base.contact,
      ...(incoming?.contact ?? {}),
    },
    profile: {
      ...base.profile,
      ...(incoming?.profile ?? {}),
      pi: {
        ...base.profile.pi,
        ...(incoming?.profile?.pi ?? {}),
      },
    },
  };

  const savedContactLinks = incoming?.contact?.links;
  const legacyContactLinks = [
    { label: "Google Scholar", href: next.contact.googleScholar },
    { label: "ORCID", href: next.contact.orcid },
    { label: "个人主页", href: next.contact.homepage },
    { label: "课题组主页", href: next.contact.groupHomepage },
  ].filter((link) => link.href?.trim());
  next.contact.links = Array.isArray(savedContactLinks)
    ? savedContactLinks
        .filter(
          (link): link is { label: string; href: string } =>
            Boolean(link) &&
            typeof link.label === "string" &&
            typeof link.href === "string",
        )
        .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
    : legacyContactLinks;
  next.contact.qrcode = "";
  next.contact.qrcodeTitle = "";
  next.contact.qrcodeDescription = "";
  const normalizedContactMaps = normalizeImageCollection(
    next.contact.map,
    incoming?.contact?.mapImages,
  );
  next.contact.map = normalizedContactMaps.image;
  next.contact.mapImages = normalizedContactMaps.images;

  if (!next.profile.heroBadge?.trim()) {
    next.profile.heroBadge = base.profile.heroBadge;
  }

  const incomingPiTitles = incoming?.profile?.pi?.titles;
  const piTitles = Array.isArray(incomingPiTitles)
    ? incomingPiTitles.filter(
        (title): title is string =>
          typeof title === "string" && title.trim().length > 0,
      )
    : [];
  const fallbackPiTitle =
    typeof incoming?.profile?.pi?.title === "string"
      ? incoming.profile.pi.title
      : next.profile.pi.title;
  const normalizedPiTitles = piTitles.length
    ? piTitles
    : String(fallbackPiTitle ?? "")
        .split(/\s*(?:\/|｜|\||、|;)\s*/)
        .map((title) => title.trim())
        .filter(Boolean);
  next.profile.pi.titles = normalizedPiTitles;
  next.profile.pi.title = normalizedPiTitles.join(" / ");

  next.researchAreas = next.researchAreas.map((item) => ({
    ...item,
    ...normalizeImageCollection(item.image, item.images),
  }));
  next.publications = next.publications.map((item) => ({
    ...item,
    ...normalizeImageCollection(item.image, item.images),
  }));
  next.news = next.news.map((item) => ({
    ...item,
    date: normalizeNewsDate(item.date),
    pinned: Boolean(item.pinned),
    detail:
      typeof item.detail === "string" && item.detail.trim()
        ? item.detail
        : item.description,
    images: Array.isArray(item.images)
      ? item.images.filter(
          (image): image is string =>
            typeof image === "string" && image.trim().length > 0,
        )
      : [],
  }));
  next.activities = next.activities.map((item) => ({
    ...item,
    ...normalizeImageCollection(item.image, item.images),
    date: normalizeActivityDate(item.date),
    detail:
      typeof item.detail === "string" && item.detail.trim()
        ? item.detail
        : item.description,
  }));
  next.joinUs = {
    ...next.joinUs,
    image: "",
    images: [],
  };

  return next as SiteDataWithDefaults;
}
