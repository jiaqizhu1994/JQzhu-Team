"use client";

import { useSiteData } from "@/lib/siteDataContext";
import { ProjectCard } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";

export function ProjectsSection() {
  const { data } = useSiteData();

  return (
    <section id="projects" className="bg-white">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow="Projects"
          title={data.sectionTitles.projects}
          subtitle={data.sectionSubtitles.projects}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((project, index) => (
            <ProjectCard key={`${project.name}-${index}`} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
