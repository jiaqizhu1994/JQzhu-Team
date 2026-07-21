import { CalendarDays, UserRound } from "lucide-react";
import type { SiteData } from "@/lib/siteDataContext";

type Project = SiteData["projects"][number];

const toneClass: Record<string, string> = {
  blue: "border-blue-100 bg-blue-50 text-academic-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  purple: "border-violet-100 bg-violet-50 text-violet-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="academic-card hover-lift p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            toneClass[project.tone] ?? toneClass.blue
          }`}
        >
          {project.type}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            project.status === "Ongoing"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {project.status}
        </span>
      </div>

      <h3 className="mt-5 min-h-[84px] text-lg font-semibold leading-7 text-slate-950">
        {project.name}
      </h3>
      <div className="mt-4 space-y-2 text-sm text-slate-500">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="text-academic-500" />
          {project.period}
        </p>
        <p className="flex items-center gap-2">
          <UserRound size={16} className="text-academic-500" />
          负责人：{project.leader}
        </p>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-600">
        {project.description}
      </p>
    </article>
  );
}
