"use client";

import { Building2, GraduationCap } from "lucide-react";
import { useSiteData } from "@/lib/siteDataContext";
import { SectionHeader } from "./SectionHeader";

export function AlumniSection() {
  const { data } = useSiteData();

  return (
    <section id="alumni" className="bg-white">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={data.sectionEyebrows.alumni}
          title={data.sectionTitles.alumni}
          subtitle={data.sectionSubtitles.alumni}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.alumni.map((item, index) => (
            <article
              key={`${item.year}-${item.destination}-${index}`}
              className="academic-card hover-lift p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-academic-700">
                  <GraduationCap size={22} />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.year}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {item.name}
              </h3>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-academic-700">
                <Building2 size={16} />
                {item.destination}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                方向：{item.field}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
