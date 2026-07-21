"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Microscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteData } from "@/lib/siteDataContext";
import { SectionHeader } from "./SectionHeader";

function ContactMapCarousel({ images }: { images: string[] }) {
  const visibleImages = images.filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage((index) =>
      Math.min(index, Math.max(0, visibleImages.length - 1)),
    );
  }, [visibleImages.length]);

  if (!visibleImages.length) {
    return <div className="h-[320px] bg-slate-100 sm:h-[430px]" />;
  }

  function showPrevious() {
    setActiveImage((index) =>
      (index - 1 + visibleImages.length) % visibleImages.length,
    );
  }

  function showNext() {
    setActiveImage((index) => (index + 1) % visibleImages.length);
  }

  return (
    <div className="relative h-[320px] w-full overflow-hidden bg-slate-100 p-3 sm:h-[430px] lg:h-[500px]">
      <img
        src={visibleImages[activeImage]}
        alt={`校园或地图图片，第 ${activeImage + 1} 张`}
        loading="lazy"
        decoding="async"
        data-zoomable
        data-zoom-images={JSON.stringify(visibleImages)}
        data-zoom-index={activeImage}
        className="h-full w-full object-contain"
      />

      {visibleImages.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="上一张校园或地图图片"
          >
            <ChevronLeft size={21} />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="下一张校园或地图图片"
          >
            <ChevronRight size={21} />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/72 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <span>{activeImage + 1} / {visibleImages.length}</span>
            <span className="flex gap-1.5">
              {visibleImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`size-1.5 rounded-full transition ${
                    activeImage === index ? "bg-cyan-300" : "bg-white/45"
                  }`}
                  aria-label={`查看第 ${index + 1} 张校园或地图图片`}
                />
              ))}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ContactSection() {
  const { data } = useSiteData();
  const { contact } = data;
  const links = contact.links.filter(
    (link) => link.label.trim() && link.href.trim(),
  );
  const linkGridColumns =
    links.length === 1
      ? "grid-cols-1"
      : links.length === 2 || links.length % 2 === 0
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="contact" className="bg-slate-50">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={data.sectionEyebrows.contact}
          title={data.sectionTitles.contact}
          subtitle={data.sectionSubtitles.contact}
        />

        <div className="mt-12 space-y-6">
          <div className="academic-card p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <a
                href={`mailto:${contact.email}`}
                className="flex h-full items-start gap-4 rounded-2xl bg-slate-50 p-5"
              >
                <Mail className="mt-1 shrink-0 text-academic-700" size={20} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-950">
                    邮箱
                  </span>
                  <span className="mt-1 block break-all text-sm text-slate-600">
                    {contact.email}
                  </span>
                </span>
              </a>

              <div className="flex h-full items-start gap-4 rounded-2xl bg-slate-50 p-5">
                <MapPin className="mt-1 shrink-0 text-academic-700" size={20} />
                <span>
                  <span className="block text-sm font-semibold text-slate-950">
                    地址
                  </span>
                  <span className="mt-1 block text-sm leading-7 text-slate-600">
                    {contact.address}
                  </span>
                </span>
              </div>

              <div className="flex h-full items-start gap-4 rounded-2xl bg-slate-50 p-5 md:col-span-2 xl:col-span-1">
                <Microscope
                  className="mt-1 shrink-0 text-academic-700"
                  size={20}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-950">
                    办公室 / 学院
                  </span>
                  <span className="mt-1 block text-sm leading-7 text-slate-600">
                    {contact.office}
                    <br />
                    {contact.school}
                  </span>
                </span>
              </div>
            </div>

            {links.length ? (
              <div className={`mt-6 grid gap-3 ${linkGridColumns}`}>
                {links.map((link, index) => (
                  <a
                    key={`${link.label}-${link.href}-${index}`}
                    href={link.href}
                    className="inline-flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-academic-700"
                  >
                    {link.label}
                    <ExternalLink size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="academic-card overflow-hidden">
            <ContactMapCarousel images={contact.mapImages} />
          </div>
        </div>
      </div>
    </section>
  );
}
