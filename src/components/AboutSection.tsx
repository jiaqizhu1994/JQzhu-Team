"use client";

import { Mail, MapPin } from "lucide-react";
import { useSiteData } from "@/lib/siteDataContext";
import { SectionHeader } from "./SectionHeader";
import { Timeline } from "./Timeline";

function renderRichText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-academic-700">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

export function AboutSection() {
  const { data } = useSiteData();
  const { profile, sectionEyebrows, sectionTitles, sectionSubtitles, aboutContentTitles } = data;

  return (
    <section id="about" className="bg-white">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={sectionEyebrows.about}
          title={sectionTitles.about}
          subtitle={sectionSubtitles.about}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="academic-card hover-lift flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full rounded-[24px] bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-5">
              <img
                src={profile.pi.avatar}
                alt={`${profile.pi.name}头像`}
                loading="lazy"
                decoding="async"
                data-zoomable
                className="mx-auto size-44 rounded-[30px] border border-white bg-white object-cover p-3 shadow-card"
              />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-slate-950">
              {profile.pi.displayName}
            </h3>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {profile.pi.titles.map((title, index) => (
                <span key={`${title}-${index}`} className="blue-chip">
                  {title}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              {profile.pi.school}
            </p>

            <div className="mt-6 w-full space-y-3 text-sm text-slate-600">
              <a
                href={`mailto:${profile.pi.email}`}
                className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-center"
              >
                <Mail size={17} className="text-academic-500" />
                <span className="min-w-0 break-all">{profile.pi.email}</span>
              </a>
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-center">
                <MapPin size={17} className="text-academic-500" />
                <span className="min-w-0">{profile.pi.address}</span>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
              {profile.pi.researchTags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="blue-chip">
                  {tag}
                </span>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            <div className="academic-card p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-academic-500">
                {aboutContentTitles.biographyEyebrow}
              </p>
              <div className="mt-5 space-y-5 text-base leading-8 text-slate-600">
                {profile.aboutParagraphs.map((paragraph, index) => (
                  <p key={`biography-${index}`}>{renderRichText(paragraph)}</p>
                ))}
              </div>
            </div>

            <Timeline />
          </div>
        </div>
      </div>
    </section>
  );
}
