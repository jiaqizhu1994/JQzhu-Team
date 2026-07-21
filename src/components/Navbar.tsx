"use client";

import { Menu, Settings, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteData } from "@/lib/siteDataContext";

const homepageSectionOrder = [
  "home",
  "about",
  "research",
  "news",
  "publications",
  "projects",
  "team",
  "activities",
  "join",
  "alumni",
  "contact",
];

export function Navbar() {
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
  const { data } = useSiteData();
  const { profile } = data;
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const activeIdRef = useRef(activeId);
  const orderedNav = useMemo(() => {
    const position = new Map(
      homepageSectionOrder.map((id, index) => [id, index]),
    );

    return [...data.nav].sort(
      (left, right) =>
        (position.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (position.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [data.nav]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = orderedNav
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            activeIdRef.current = entry.target.id;
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [orderedNav]);

  useEffect(() => {
    let resizeTimer: number | undefined;
    let previousWidth = window.innerWidth;
    let anchorId: string | null = null;

    const keepCurrentSectionVisible = () => {
      if (window.innerWidth === previousWidth) {
        return;
      }

      previousWidth = window.innerWidth;
      anchorId ??= activeIdRef.current;

      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        const section = anchorId ? document.getElementById(anchorId) : null;
        if (section) {
          const navigationOffset = 96;
          const top = Math.max(
            0,
            section.getBoundingClientRect().top + window.scrollY - navigationOffset,
          );
          window.scrollTo({ top, behavior: "auto" });
        }
        anchorId = null;
        resizeTimer = undefined;
      }, 180);
    };

    window.addEventListener("resize", keepCurrentSectionVisible);
    return () => {
      window.removeEventListener("resize", keepCurrentSectionVisible);
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-b border-white/15 bg-slate-950/46 shadow-[0_16px_45px_rgba(2,6,23,0.24)] backdrop-blur-2xl"
      }`}
    >
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="group flex items-center gap-3">
          {profile.navLogo ? (
            <img
              src={profile.navLogo}
              alt={`${profile.navTitle} Logo`}
              className="size-11 rounded-2xl border border-white/20 bg-white object-cover shadow-lg shadow-slate-950/25"
            />
          ) : (
            <span
              className={`flex size-11 items-center justify-center rounded-2xl text-sm font-bold shadow-lg transition ${
                isScrolled
                  ? "bg-academic-700 text-white shadow-blue-900/20"
                  : "bg-white text-academic-700 shadow-slate-950/25"
              }`}
            >
              AO
            </span>
          )}
          <span className="hidden sm:block">
            <span
              className={`block text-sm font-semibold transition ${
                isScrolled ? "text-slate-950" : "text-white"
              }`}
            >
              {profile.navTitle || profile.groupAbbr}
            </span>
            <span
              className={`block text-xs transition ${
                isScrolled ? "text-slate-500" : "text-cyan-100/90"
              }`}
            >
              {profile.navSubtitle}
            </span>
          </span>
        </a>

        <div className="hidden min-w-0 items-center gap-1 xl:flex">
          {orderedNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                activeId === item.id
                  ? isScrolled
                    ? "bg-blue-50 text-academic-700"
                    : "bg-white text-academic-700 shadow-sm shadow-slate-950/10"
                  : isScrolled
                    ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    : "text-slate-100/90 hover:bg-white/12 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {!isStaticExport ? (
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
              isScrolled
                ? "border-slate-200 bg-white/75 text-slate-700 hover:border-blue-200 hover:text-academic-700"
                : "border-white/25 bg-white/16 text-white shadow-lg shadow-slate-950/10 hover:bg-white/24"
            }`}
          >
            <Settings size={16} />
            管理
          </a>
        </div>
        ) : null}

        <button
          type="button"
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition xl:hidden ${
            isScrolled
              ? "border-slate-200 bg-white text-slate-700"
              : "border-white/25 bg-white/16 text-white"
          }`}
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? "关闭菜单" : "打开菜单"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-xl xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {orderedNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  activeId === item.id
                    ? "bg-blue-50 text-academic-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </a>
            ))}
            {!isStaticExport ? (
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} />
              管理后台
            </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
