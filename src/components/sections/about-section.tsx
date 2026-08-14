"use client";

import { Mail, MapPin } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";

import { BrandIcon, TechBadge } from "@/components/ui/brand-icon";
import WindowFrame from "@/components/ui/window-frame";

// 카드 전체가 순서대로 나타나도록 자식 요소의 등장 시점을 늦춘다.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// 기술스택
const skillGroups = [
  {
    title: "Core Stack",
    skills: ["Python", "Django", "Vue", "Tailwind CSS", "MySQL"],
  },
  {
    title: "Tools",
    skills: ["Figma", "Jira"],
  },
  {
    title: "Currently Learning",
    skills: ["React", "JavaScript", "TypeScript", "Java"],
  },
];

// SW 역량테스트 등급. CAREER와 HIGHLIGHTS가 같은 값을 공유한다.
const swCompetencyGrade = "Grade A+ (Python)";

// 경력. 항목을 추가하면 카드에 순서대로 그려진다.
const career = [
  {
    title: "SSAFY 15th",
    role: "",
    period: "2026.01 ~ 2026.12",
    details: [
      "1학기 성적최우수 (1st)",
      "Monthly member (1, 3월)",
      `SAMSUNG SW Competency Test - ${swCompetencyGrade}`,
    ],
  },
  {
    title: "Math Academy",
    role: "Team Leader",
    period: "2021.07 ~ 2025.12",
    details: ["초,중,고 수학교육", "학원운영 시스템 기획 및 개발"],
  },
  {
    title: "ROK Army",
    role: "Officer",
    period: "2019.03 ~ 2021.06",
    details: ["근무유공표창 2회", "경계작전유공표창 1회"],
  },
];

// 핵심 강점 요약. 3줄 이내로 유지한다.
const highlights = [
  `SSAFY SW Competency Test — ${swCompetencyGrade}`,
  "Frontend-focused Web Service Development",
  "Team Leadership Experience",
];

const certifications = ["정보처리기사 (필기합격)"];

const links = [
  { label: "GitHub", href: "https://github.com/hj0543" },
  { label: "Email", href: "mailto:hj0543@gmail.com" },
];

/** 상단 ABOUT ME 라벨과 같은 문법을 쓰는 카드 안 소제목. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-label">
      {children}
    </h3>
  );
}

/** 소개, 경력, 기술 정보를 데스크톱 창 형태로 묶는 프로필 화면. */
export default function AboutSection(frame: {
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
}) {
  return (
      <WindowFrame
        title="about-me.tsx"
        defaultWidth={840}
        defaultHeight={720}
        {...frame}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="p-8 sm:p-9"
        >
          <motion.p
            variants={item}
            className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-label"
          >
            <span className="h-px w-6 bg-label/50" />
            About Me
          </motion.p>

          <motion.div
            variants={item}
            className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
              Hello,
              <br />
              A developer you&apos;d love to work with.
              <span className="text-accent">
                <br />
                Hyeonjin Jeong
              </span>
            </h2>

            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-ink/15 bg-ink/5 shadow-[0_16px_40px_rgb(0_0_0/0.24)] sm:h-32 sm:w-32">
              <Image
                src="/my_profile/my_profile.jpg"
                alt="Hyeonjin Jeong profile photo"
                width={2160}
                height={2160}
                sizes="(max-width: 640px) 112px, 128px"
                className="h-[180%] w-[180%] max-w-none -translate-x-[22.222%] object-cover object-top"
              />
            </div>
          </motion.div>

          <motion.div variants={item} className="mt-7 space-y-4">
            {skillGroups.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                  {group.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <TechBadge key={skill} label={skill} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.section
            variants={item}
            className="mt-8 border-t border-ink/10 pt-6"
          >
            <SectionTitle>Career</SectionTitle>
            <ul className="mt-4 space-y-4">
              {career.map((entry) => (
                <li key={entry.title}>
                  {/* 제목·역할은 왼쪽, 기간은 오른쪽 끝에 정렬한다. */}
                  <div className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="text-sm font-semibold text-foreground">
                      {entry.title}
                    </span>
                    {entry.role ? (
                      <span className="text-xs text-foreground/50">
                        {entry.role}
                      </span>
                    ) : null}
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-foreground/45">
                      {entry.period}
                    </span>
                  </div>

                  {entry.details.length > 0 ? (
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 marker:text-foreground/30">
                      {entry.details.map((detail) => (
                        <li
                          key={detail}
                          className="text-xs leading-relaxed text-foreground/55"
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            variants={item}
            className="mt-8 border-t border-ink/10 pt-6"
          >
            <SectionTitle>Highlights</SectionTitle>
            <ul className="mt-4 space-y-1.5">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-baseline gap-2 text-sm font-medium text-foreground/75"
                >
                  <span aria-hidden="true" className="text-accent">
                    •
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            variants={item}
            className="mt-8 border-t border-ink/10 pt-6"
          >
            <SectionTitle>Certified</SectionTitle>
            <ul className="mt-4 space-y-1.5">
              {certifications.map((certification) => (
                <li
                  key={certification}
                  className="text-sm text-foreground/65"
                >
                  {certification}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-ink/10 pt-6"
          >
            <span className="flex items-center gap-1.5 text-xs text-foreground/45">
              <MapPin aria-hidden="true" size={14} strokeWidth={1.7} />
              Gumi, KR
            </span>

            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center gap-1.5 text-xs text-foreground/60 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
              >
                {label === "GitHub" ? (
                  <BrandIcon name="GitHub" size={14} />
                ) : (
                  <Mail aria-hidden="true" size={14} strokeWidth={1.7} />
                )}
                {label}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </WindowFrame>
  );
}
