"use client";

import { useSiteData } from "@/lib/siteDataContext";
import { ResearchCard } from "./ResearchCard";
import { SectionHeader } from "./SectionHeader";

export function ResearchSection() {
  const { data } = useSiteData();

  return (
    <section id="research" className="bg-slate-50">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={data.sectionEyebrows.research}
          title={data.sectionTitles.research}
          subtitle={data.sectionSubtitles.research}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {data.researchAreas.map((area, index) => (
            <ResearchCard key={`${area.title}-${index}`} area={area} />
          ))}
        </div>
      </div>
    </section>
  );
}
