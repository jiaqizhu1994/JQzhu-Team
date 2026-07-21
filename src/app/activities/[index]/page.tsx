import { ActivityDetailClient } from "./ActivityDetailClient";
import { SiteDataProvider } from "@/lib/siteDataContext";
import { readSavedSiteData } from "@/lib/siteDataServer";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const data = await readSavedSiteData();
  return (data?.activities ?? []).map((_, index) => ({ index: String(index) }));
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ index: string }>;
}) {
  const { index } = await params;
  const activityIndex = Number.parseInt(index, 10);
  const initialData = await readSavedSiteData();

  if (!initialData) {
    return null;
  }

  return (
    <SiteDataProvider initialData={initialData}>
      <ActivityDetailClient activityIndex={activityIndex} />
    </SiteDataProvider>
  );
}
