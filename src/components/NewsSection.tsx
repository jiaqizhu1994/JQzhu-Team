"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSiteData } from "@/lib/siteDataContext";
import { orderNewsItems } from "@/lib/contentOrdering";
import { SectionHeader } from "./SectionHeader";

const typeClass: Record<string, string> = {
  Paper: "bg-blue-50 text-academic-700 border-blue-100",
  Award: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Project: "bg-cyan-50 text-cyan-700 border-cyan-100",
  Conference: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Group: "bg-slate-100 text-slate-700 border-slate-200",
};

export function NewsSection() {
  const { data } = useSiteData();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const pageSizeOptions = [5, 10, 15, 20];
  const orderedNews = orderNewsItems(data.news);
  const totalPages = Math.max(1, Math.ceil(orderedNews.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = orderedNews.slice(pageStart, pageStart + pageSize);

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
    <section id="news" className="bg-white">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={data.sectionEyebrows.news}
          title={data.sectionTitles.news}
          subtitle={data.sectionSubtitles.news}
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
              aria-label="每页新闻条数"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>条</span>
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-card border border-slate-200 bg-white shadow-card">
          {pageItems.map(({ item, index: itemIndex }, pageIndex) => {

            return (
            <Link
              key={`${item.date}-${item.title}-${itemIndex}`}
              href={`/news/${itemIndex}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group grid gap-4 p-5 transition hover:bg-blue-50/55 sm:grid-cols-[112px_1fr] sm:p-6 ${
                pageIndex === pageItems.length - 1
                  ? ""
                  : "border-b border-slate-100"
              }`}
            >
              <div>
                <p className="font-semibold text-academic-700">{item.date}</p>
                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    typeClass[item.type] ?? typeClass.Group
                  }`}
                >
                  {item.type}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-2">
                    {item.pinned ? (
                      <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                        <Pin size={11} className="mr-1" />
                        置顶
                      </span>
                    ) : null}
                    <h3 className="min-w-0 text-lg font-semibold text-slate-950 transition group-hover:text-academic-700">
                      {item.title}
                    </h3>
                  </div>
                  <ChevronRight
                    size={20}
                    className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-academic-500"
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-500">
                  {item.description}
                </p>
              </div>
            </Link>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
            aria-label="新闻分页"
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
