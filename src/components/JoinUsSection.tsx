"use client";

import { Mail } from "lucide-react";
import { useSiteData } from "@/lib/siteDataContext";

export function JoinUsSection() {
  const { data } = useSiteData();
  const { joinUs } = data;

  return (
    <section id="join" className="bg-slate-50">
      <div className="section-shell section-fade">
        <div className="overflow-hidden rounded-[28px] bg-academic-950 text-white shadow-2xl shadow-slate-950/20">
          <div className="bg-[linear-gradient(135deg,rgba(11,61,145,0.92),rgba(2,6,23,0.98))] p-6 sm:p-10 lg:p-12">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Recruitment
              </p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                {joinUs.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-200">
                {joinUs.description}
              </p>
            </div>

            <div className="mt-8 grid items-start gap-5 lg:grid-cols-2">
              <div className="rounded-card border border-white/10 bg-white/8 p-5 sm:p-6">
                <h3 className="font-semibold text-white">招生方向</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {joinUs.directions.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-medium text-cyan-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-card border border-white/10 bg-white/8 p-5 sm:p-6">
                <h3 className="font-semibold text-white">基本要求</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {joinUs.requirements.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-quantum-green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex">
              <a
                href={`mailto:${data.contact.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-academic-700 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <Mail size={16} />
                发送简历
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
