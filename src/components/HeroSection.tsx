"use client";

import { ArrowRight, Mail, Send } from "lucide-react";
import { useSiteData } from "@/lib/siteDataContext";

export function HeroSection() {
  const { data } = useSiteData();
  const { profile, stats } = data;

  return (
    <section id="home" className="hero-surface pt-20 text-white">
      <div className="section-shell relative z-10 grid min-h-[780px] items-center gap-12 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div className="section-fade">
          <p className="inline-flex rounded-full border border-cyan-200/25 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
            {profile.heroBadge ||
              "Quantum dots · Optoelectronics · Intelligent sensing"}
          </p>
          <h1 className="mt-8 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
            {profile.groupName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-cyan-100 sm:text-xl">
            {profile.englishName}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            {profile.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {profile.keywords.map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur"
              >
                {keyword}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#research"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-academic-700 transition hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              研究方向
              <ArrowRight size={17} />
            </a>
            <a
              href="#publications"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              代表论文
            </a>
            <a
              href="#join"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/70 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
            >
              <Send size={16} />
              加入我们
            </a>
          </div>
        </div>

        <div className="section-fade">
          <div className="rounded-[28px] border border-white/16 bg-white/12 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="circuit-board rounded-[24px] border border-white/10 p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={profile.pi.avatar}
                  alt={`${profile.pi.name}头像`}
                  data-zoomable
                  className="size-32 rounded-[28px] border border-white/30 bg-white/10 object-cover p-2 shadow-xl"
                />
                <h2 className="mt-5 text-2xl font-semibold text-white">
                  {profile.pi.displayName}
                </h2>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {profile.pi.titles.map((title, index) => (
                    <span
                      key={`${title}-${index}`}
                      className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-medium text-cyan-100"
                    >
                      {title}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-200">
                  {profile.pi.school}
                </p>
                <a
                  href={`mailto:${profile.pi.email}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100"
                >
                  <Mail size={15} />
                  {profile.pi.email}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {profile.pi.links.map((link, index) => (
                  <a
                    key={`${link.label}-${index}`}
                    href={link.href}
                    className="rounded-full border border-white/15 bg-slate-950/20 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-white/10"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {stats.map((stat, index) => (
                  <div
                    key={`${stat.label}-${index}`}
                    className="min-w-0 flex-[1_1_96px] rounded-2xl border border-white/12 bg-white/10 p-4 text-center"
                  >
                    <p className="break-words text-2xl font-semibold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
