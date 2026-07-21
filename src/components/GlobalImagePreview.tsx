"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

type PreviewImage = {
  src: string;
  alt: string;
};

export function GlobalImagePreview() {
  const [preview, setPreview] = useState<{
    images: PreviewImage[];
    activeIndex: number;
  } | null>(null);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLImageElement) || !target.dataset.zoomable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const fallbackImage = target.currentSrc || target.src;
      const alt = target.alt || "图片预览";
      let sources = [fallbackImage];

      try {
        const parsedSources = JSON.parse(target.dataset.zoomImages ?? "[]");
        if (
          Array.isArray(parsedSources) &&
          parsedSources.every((source) => typeof source === "string") &&
          parsedSources.length
        ) {
          sources = parsedSources;
        }
      } catch {
        // A malformed data attribute should still allow the clicked image to open.
      }

      const requestedIndex = Number.parseInt(target.dataset.zoomIndex ?? "0", 10);
      setPreview({
        images: sources.map((source, index) => ({
          src: source,
          alt: sources.length > 1 ? `${alt}，第 ${index + 1} 张` : alt,
        })),
        activeIndex: Number.isFinite(requestedIndex)
          ? Math.min(Math.max(0, requestedIndex), sources.length - 1)
          : 0,
      });
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  useEffect(() => {
    if (!preview) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreview(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preview]);

  if (!preview) {
    return null;
  }

  const activeImage = preview.images[preview.activeIndex];
  const hasMultipleImages = preview.images.length > 1;

  function showPrevious() {
    setPreview((current) =>
      current
        ? {
            ...current,
            activeIndex:
              (current.activeIndex - 1 + current.images.length) %
              current.images.length,
          }
        : null,
    );
  }

  function showNext() {
    setPreview((current) =>
      current
        ? {
            ...current,
            activeIndex: (current.activeIndex + 1) % current.images.length,
          }
        : null,
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/88 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={activeImage.alt}
      onClick={() => setPreview(null)}
    >
      <div
        className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="absolute -right-3 -top-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg transition hover:bg-slate-800"
          aria-label="关闭图片预览"
        >
          <X size={20} />
        </button>
        {hasMultipleImages ? (
          <button
            type="button"
            onClick={showPrevious}
            className="absolute -left-14 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg transition hover:bg-slate-800 sm:-left-16"
            aria-label="上一张图片"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="max-h-[86vh] max-w-[88vw] rounded-card bg-white object-contain shadow-2xl"
        />
        {hasMultipleImages ? (
          <button
            type="button"
            onClick={showNext}
            className="absolute -right-14 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/80 text-white shadow-lg transition hover:bg-slate-800 sm:-right-16"
            aria-label="下一张图片"
          >
            <ChevronRight size={22} />
          </button>
        ) : null}
        {hasMultipleImages ? (
          <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white">
            <span>{preview.activeIndex + 1} / {preview.images.length}</span>
            <span className="flex gap-1.5">
              {preview.images.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  onClick={() =>
                    setPreview((current) =>
                      current ? { ...current, activeIndex: index } : null,
                    )
                  }
                  className={`size-1.5 rounded-full transition ${
                    preview.activeIndex === index ? "bg-cyan-300" : "bg-white/45"
                  }`}
                  aria-label={`查看第 ${index + 1} 张图片`}
                />
              ))}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
