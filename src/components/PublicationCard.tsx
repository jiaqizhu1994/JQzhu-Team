"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteData } from "@/lib/siteDataContext";

type Publication = SiteData["publications"][number];

function renderHighlightedText(value: string) {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const isHighlighted = part.startsWith("**") && part.endsWith("**");

    return isHighlighted ? (
      <strong key={`${part}-${index}`} className="font-semibold text-academic-700">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

function PublicationLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const isValidHref = href && href !== "#";

  if (!isValidHref) {
    return (
      <button
        type="button"
        className="secondary-button cursor-not-allowed px-4 py-2 opacity-50"
        disabled
        title="后台尚未填写有效链接"
      >
        <Icon size={15} className="mr-2" />
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="secondary-button px-4 py-2"
    >
      <Icon size={15} className="mr-2" />
      {label}
    </a>
  );
}

function PublicationImageCarousel({ paper }: { paper: Publication }) {
  const images = paper.images.length ? paper.images : [paper.image];
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
    <div className="relative h-56 overflow-hidden bg-slate-100 md:h-full md:min-h-[250px]">
      <img
        src={images[activeImage]}
        alt={`${paper.journal} graphical abstract，第 ${activeImage + 1} 张`}
        loading="lazy"
        decoding="async"
        data-zoomable
        data-zoom-images={JSON.stringify(images)}
        data-zoom-index={activeImage}
        className="h-full w-full object-contain p-4"
      />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="上一张论文图片"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="下一张论文图片"
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
                  aria-label={`查看第 ${index + 1} 张论文图片`}
                />
              ))}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function PublicationCard({ paper }: { paper: Publication }) {
  return (
    <article className="academic-card hover-lift overflow-hidden md:grid md:grid-cols-[240px_1fr]">
      <PublicationImageCarousel paper={paper} />
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="blue-chip">{paper.journal}</span>
          <span className="green-chip">{paper.year}</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-8 text-slate-950">
          {paper.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {renderHighlightedText(paper.authors)}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <PublicationLink href={paper.links.doi} icon={BookOpen} label="DOI" />
        </div>
      </div>
    </article>
  );
}
