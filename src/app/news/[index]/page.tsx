import { NewsDetailClient } from "./NewsDetailClient";
import { SiteDataProvider } from "@/lib/siteDataContext";
import { readSavedSiteData } from "@/lib/siteDataServer";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const data = await readSavedSiteData();
  return (data?.news ?? []).map((_, index) => ({ index: String(index) }));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ index: string }>;
}) {
  const { index } = await params;
  const newsIndex = Number.parseInt(index, 10);
  const initialData = await readSavedSiteData();

  if (!initialData) {
    return null;
  }

  return (
    <SiteDataProvider initialData={initialData}>
      <NewsDetailClient newsIndex={newsIndex} />
    </SiteDataProvider>
  );
}
