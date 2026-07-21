"use client";

import { useSiteData } from "@/lib/siteDataContext";

export function Timeline() {
  const { data } = useSiteData();
  const { aboutContentTitles } = data;

  return (
    <div className="academic-card p-6 sm:p-8">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-academic-500">
            {aboutContentTitles.timelineEyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {aboutContentTitles.timelineTitle}
          </h3>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[104px] top-2 hidden h-[calc(100%-24px)] w-px bg-blue-100 sm:block" />
        <div className="space-y-7">
          {data.timeline.map((item, index) => (
            <div
              key={`${item.year}-${item.title}-${index}`}
              className="grid gap-3 sm:grid-cols-[96px_1fr]"
            >
              <p className="text-sm font-semibold text-academic-700">
                {item.year}
              </p>
              <div className="relative rounded-2xl bg-slate-50 p-5">
                <span className="absolute -left-[19px] top-5 hidden size-4 rounded-full border-4 border-white bg-academic-500 shadow-sm sm:block" />
                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
