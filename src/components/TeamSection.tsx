"use client";

import { Building2, GraduationCap, Mail } from "lucide-react";
import type { SiteData } from "@/lib/siteDataContext";
import { useSiteData } from "@/lib/siteDataContext";
import { SectionHeader } from "./SectionHeader";

type Member =
  | SiteData["members"]["principalInvestigator"]
  | SiteData["members"]["masterStudents"][number];

function MemberCard({
  member,
  large = false,
}: {
  member: Member;
  large?: boolean;
}) {
  return (
    <article
      className={`academic-card hover-lift p-5 ${
        large ? "grid gap-6 sm:grid-cols-[140px_1fr] sm:p-7" : ""
      }`}
    >
      <img
        src={member.avatar}
        alt={`${member.name}头像`}
        loading="lazy"
        decoding="async"
        data-zoomable
        className={`rounded-[24px] border border-slate-100 bg-slate-50 object-cover p-2 ${
          large ? "size-36" : "size-24"
        }`}
      />
      <div className={large ? "self-center" : "mt-4"}>
        <h3 className="text-lg font-semibold text-slate-950">{member.name}</h3>
        <p className="mt-1 text-sm font-semibold text-academic-700">
          {member.role}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-500">{member.focus}</p>
        <a
          href={`mailto:${member.email}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-academic-700"
        >
          <Mail size={15} />
          {member.email}
        </a>
      </div>
    </article>
  );
}

function MemberGroup({ title, members }: { title: string; members: Member[] }) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-5 text-xl font-semibold text-slate-950">{title}</h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => (
          <MemberCard key={`${member.name}-${member.role}-${index}`} member={member} />
        ))}
      </div>
    </div>
  );
}

export function TeamSection() {
  const { data } = useSiteData();
  const { members, sectionEyebrows, teamGroupTitles } = data;

  return (
    <section id="team" className="bg-slate-50">
      <div className="section-shell section-fade">
        <SectionHeader
          eyebrow={sectionEyebrows.team}
          title={data.sectionTitles.team}
          subtitle={data.sectionSubtitles.team}
        />

        <div className="mt-12 space-y-10">
          <div>
            <h3 className="mb-5 text-xl font-semibold text-slate-950">
              {teamGroupTitles.principalInvestigator}
            </h3>
            <MemberCard member={members.principalInvestigator} large />
          </div>

          <MemberGroup
            title={teamGroupTitles.postdoctoralResearchers}
            members={members.postdoctoralResearchers}
          />
          <MemberGroup title={teamGroupTitles.phdStudents} members={members.phdStudents} />
          <MemberGroup
            title={teamGroupTitles.masterStudents}
            members={members.masterStudents}
          />
          <MemberGroup
            title={teamGroupTitles.undergraduateInterns}
            members={members.undergraduateInterns}
          />

          <div className="border-t border-slate-200 pt-12">
            <SectionHeader
              eyebrow={data.sectionEyebrows.alumni}
              title={data.sectionTitles.alumni}
              subtitle={data.sectionSubtitles.alumni}
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.alumni.map((item, index) => (
                <article
                  key={`${item.year}-${item.destination}-${index}`}
                  className="academic-card hover-lift p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-academic-700">
                      <GraduationCap size={22} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.year}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    {item.name}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-academic-700">
                    <Building2 size={16} />
                    {item.destination}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    方向：{item.field}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
