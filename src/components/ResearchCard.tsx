"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteData } from "@/lib/siteDataContext";

type ResearchArea = SiteData["researchAreas"][number];

function ResearchImageCarousel({ area }: { area: ResearchArea }) {
  const images = area.images.length ? area.images : [area.image];
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage((index) => Math.min(index, Math.max(0, images.length - 1)));
  }, [images.length]);

  function showPrevious() {
    setActiveImage((index) => (index - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveImage((index) => (index + 1) % images.length);
  }

  return (
    <div className="relative h-56 overflow-hidden border-b border-white/70 bg-white/60">
      <img
        src={images[activeImage]}
        alt={`${area.title}，第 ${activeImage + 1} 张图片`}
        loading="lazy"
        decoding="async"
        data-zoomable
        data-zoom-images={JSON.stringify(images)}
        data-zoom-index={activeImage}
        className="h-full w-full object-contain p-4 transition duration-500"
      />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="上一张研究方向图片"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="下一张研究方向图片"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span>{activeImage + 1} / {images.length}</span>
            <span className="flex gap-1.5">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`size-1.5 rounded-full transition ${
                    activeImage === index ? "bg-cyan-300" : "bg-white/45"
                  }`}
                  aria-label={`查看第 ${index + 1} 张研究方向图片`}
                />
              ))}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ResearchCard({ area }: { area: ResearchArea }) {
  return (
    <article
      className={`academic-card hover-lift overflow-hidden bg-gradient-to-br ${area.accent}`}
    >
      <ResearchImageCarousel area={area} />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-950">{area.title}</h3>
        <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-600">
          {area.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {area.tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="chip bg-white/80">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
