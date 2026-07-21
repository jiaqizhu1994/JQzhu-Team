"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Images,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteData } from "@/lib/siteDataContext";

export function NewsDetailClient({ newsIndex }: { newsIndex: number }) {
  const { data, isReady } = useSiteData();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const item = Number.isInteger(newsIndex) ? data.news[newsIndex] : undefined;
  const images = item?.images ?? [];

  useEffect(() => {
    if (selectedImageIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedImageIndex(null);
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        setSelectedImageIndex((index) =>
          index === null ? null : (index - 1 + images.length) % images.length,
        );
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        setSelectedImageIndex((index) =>
          index === null ? null : (index + 1) % images.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, selectedImageIndex]);

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-semibold text-slate-500">正在加载新闻内容...</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="section-eyebrow">News</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            未找到该新闻
          </h1>
          <Link href="/#news" className="secondary-button mt-6">
            <ArrowLeft size={16} className="mr-2" />
            返回新闻动态
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = (item.detail || item.description)
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  function showPreviousImage() {
    setSelectedImageIndex((index) =>
      index === null ? null : (index - 1 + images.length) % images.length,
    );
  }

  function showNextImage() {
    setSelectedImageIndex((index) =>
      index === null ? null : (index + 1) % images.length,
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-academic-700 text-sm font-bold text-white shadow-lg shadow-blue-900/20">
              AO
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-950">
                {data.profile.groupAbbr}
              </span>
              <span className="block text-xs text-slate-500">News Detail</span>
            </span>
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="blue-chip">{item.type}</span>
          <span className="inline-flex items-center gap-2 text-slate-500">
            <CalendarDays size={16} />
            {item.date}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-6 max-w-4xl border-l-4 border-academic-500 pl-5 text-lg leading-9 text-slate-600">
          {item.description}
        </p>

        <div className="mt-12 max-w-4xl space-y-6 text-base leading-9 text-slate-700">
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          ))}
        </div>

        {images.length ? (
          <section className="mt-14 border-t border-slate-200 pt-10">
            <div className="flex items-center gap-3">
              <Images size={20} className="text-academic-600" />
              <h2 className="text-xl font-semibold text-slate-950">
                相关图片
              </h2>
              <span className="text-sm text-slate-500">{images.length} 张</span>
            </div>
            <div className="mt-7 space-y-8">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className="group block w-full overflow-hidden rounded-card border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft sm:p-6"
                >
                  <img
                    src={image}
                    alt={`${item.title}，第 ${index + 1} 张图片`}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto h-auto max-h-[820px] w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {selectedImageIndex !== null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="查看新闻图片"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="关闭图片"
          >
            <X size={22} />
          </button>
          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              className="absolute left-4 inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
              aria-label="上一张"
            >
              <ChevronLeft size={26} />
            </button>
          ) : null}
          <img
            src={images[selectedImageIndex]}
            alt={`${item.title}大图`}
            className="max-h-[86vh] max-w-[88vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              className="absolute right-4 inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
              aria-label="下一张"
            >
              <ChevronRight size={26} />
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
