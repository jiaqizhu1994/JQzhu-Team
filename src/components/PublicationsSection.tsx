"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSiteData } from "@/lib/siteDataContext";
import { orderPublicationItems } from "@/lib/contentOrdering";
import { PublicationCard } from "./PublicationCard";
import { SectionHeader } from "./SectionHeader";

export function PublicationsSection() {
  const { data } = useSiteData();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const pageSizeOptions = [5, 10, 15, 20];
  const orderedPublications = orderPublicationItems(data.publications);
  const totalPages = Math.max(1, Math.ceil(orderedPublications.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = orderedPublications.slice(pageStart, pageStart + pageSize);

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
    <section id="publications" className="bg-slate-50">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={data.sectionEyebrows.publications}
          title={data.sectionTitles.publications}
          subtitle={data.sectionSubtitles.publications}
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
              aria-label="每页论文条数"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>篇</span>
          </label>
        </div>

        <div className="mt-4 space-y-5">
          {pageItems.map(({ item: paper, index }) => (
            <PublicationCard
              key={`${paper.title}-${index}`}
              paper={paper}
            />
          ))}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
            aria-label="论文分页"
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
