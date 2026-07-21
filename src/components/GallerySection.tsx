"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSiteData } from "@/lib/siteDataContext";
import { orderActivityItems } from "@/lib/contentOrdering";
import { SectionHeader } from "./SectionHeader";

function ActivityImageCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const visibleImages = images.filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage((index) => Math.min(index, Math.max(0, visibleImages.length - 1)));
  }, [visibleImages.length]);

  if (!visibleImages.length) {
    return <div className="aspect-[16/10] bg-slate-100" />;
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
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 p-3">
      <img
        src={visibleImages[activeImage]}
        alt={`${title}，第 ${activeImage + 1} 张图片`}
        loading="lazy"
        decoding="async"
        data-zoomable
        data-zoom-images={JSON.stringify(visibleImages)}
        data-zoom-index={activeImage}
        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
      />
      {visibleImages.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="上一张活动图片"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 shadow-md transition hover:bg-white hover:text-academic-700"
            aria-label="下一张活动图片"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/72 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
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
                  aria-label={`查看第 ${index + 1} 张活动图片`}
                />
              ))}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function GallerySection() {
  const { data } = useSiteData();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const pageSizeOptions = [3, 6, 9, 12];
  const totalPages = Math.max(1, Math.ceil(data.activities.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = orderActivityItems(data.activities).slice(
    pageStart,
    pageStart + pageSize,
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    },
    [],
  );

  function scrollToResultsTop() {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      scrollFrameRef.current = null;
    });
  }

  function changePage(page: number) {
    setCurrentPage(Math.min(totalPages, Math.max(1, page)));
    scrollToResultsTop();
  }

  return (
    <section id="activities" className="bg-white">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={data.sectionEyebrows.activities}
          title={data.sectionTitles.activities}
          subtitle={data.sectionSubtitles.activities}
        />

        <div ref={resultsRef} className="mt-8 flex scroll-mt-28 justify-end">
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span>每页</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                changePage(1);
              }}
              className="bg-transparent font-semibold text-academic-700 outline-none"
              aria-label="每页活动条数"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>项</span>
          </label>
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map(({ item: activity, index }) => {
            const images = activity.images.length
              ? activity.images
              : [activity.image];

            return (
              <article
                key={`${activity.date}-${activity.title}-${index}`}
                className="group academic-card hover-lift overflow-hidden"
              >
                <ActivityImageCarousel images={images} title={activity.title} />
                <Link
                  href={`/activities/${index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="blue-chip">{activity.type}</span>
                    <span className="text-sm font-medium text-slate-500">
                      {activity.date}
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-7 text-slate-950 transition group-hover:text-academic-700">
                      {activity.title}
                    </h3>
                    <ChevronRight
                      size={20}
                      className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-academic-500"
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-500">
                    {activity.description}
                  </p>
                </Link>
              </article>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
            aria-label="组内活动分页"
          >
            <button
              type="button"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-academic-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="上一页"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => changePage(page)}
                  className={`inline-flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    currentPage === page
                      ? "border-academic-700 bg-academic-700 text-white shadow-lg shadow-blue-900/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-academic-700"
                  }`}
                  aria-label={`第 ${page} 页`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-academic-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="下一页"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
