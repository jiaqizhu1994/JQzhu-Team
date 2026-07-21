import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { GallerySection } from "@/components/GallerySection";
import { HeroSection } from "@/components/HeroSection";
import { JoinUsSection } from "@/components/JoinUsSection";
import { Navbar } from "@/components/Navbar";
import { NewsSection } from "@/components/NewsSection";
import { PublicationsSection } from "@/components/PublicationsSection";
import { ResearchSection } from "@/components/ResearchSection";
import { TeamSection } from "@/components/TeamSection";
import { SiteDataProvider } from "@/lib/siteDataContext";
import { readSavedSiteData } from "@/lib/siteDataServer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await readSavedSiteData();

  if (!initialData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-slate-600">
        网站内容尚未配置，请先登录管理后台保存内容。
      </main>
    );
  }

  return (
    <SiteDataProvider initialData={initialData}>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ResearchSection />
        <NewsSection />
        <PublicationsSection />
        <TeamSection />
        <GallerySection />
        <JoinUsSection />
        <ContactSection />
      </main>
    </SiteDataProvider>
  );
}
