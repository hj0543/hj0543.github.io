"use client";

import {
  CalendarDays,
  ExternalLink,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";

import { BrandIcon, TechBadge } from "@/components/ui/brand-icon";
import ProjectCarousel, {
  type ProjectScreen,
} from "@/components/ui/project-carousel";
import WindowFrame from "@/components/ui/window-frame";

import styles from "./project-doc.module.css";

export type Project = {
  /** 확장자를 뗀 파일 이름. 창 제목에 그대로 쓴다. */
  slug: string;
  name: string;
  tagline: string;
  /** /public 기준 경로. 없으면 자리표시 타일을 대신 그린다. */
  thumbnail?: string;
  role: string;
  period: string;
  team: string;
  stack: string[];
  /** 상세 화면 상단 캐러셀에 표시할 프로젝트 스크린샷. */
  screens: ProjectScreen[];
  /** GitHub·배포·시연영상 등 외부 링크. 문서 상단에 버튼으로 그린다. */
  links: { label: string; href: string }[];
  /** 대표 프로젝트. 목록에서 두 칸 폭으로 강조한다. */
  featured: boolean;
  /** 빌드할 때 마크다운을 변환해 둔 본문. */
  html: string;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.14 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/** 문서 상단의 GitHub·배포 링크 버튼 줄. */
function LinkButtons({ links }: { links: Project["links"] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, href }) => {
        const isGitHub = /github/i.test(label);
        return (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-ink/12 bg-ink/6 px-3 py-1.5 font-mono text-[11px] text-foreground/75 transition-colors hover:border-accent/45 hover:text-accent focus-visible:border-accent/45 focus-visible:outline-none"
          >
            {isGitHub ? (
              <BrandIcon name="GitHub" size={12} />
            ) : (
              <ExternalLink aria-hidden="true" size={12} strokeWidth={1.8} />
            )}
            {label}
          </a>
        );
      })}
    </div>
  );
}

/** 썸네일 자리. 이미지가 없으면 이름 머리글자로 채운다. */
function Thumb({ project }: { project: Project }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-ink/10 bg-linear-to-br from-accent-deep/25 to-accent/10">
      {project.thumbnail ? (
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 320px"
          className="object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center font-mono text-2xl text-foreground/25">
          {project.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function Meta({ project }: { project: Project }) {
  const rows = [
    { icon: UserCog, value: project.role },
    { icon: CalendarDays, value: project.period },
    { icon: Users, value: project.team },
  ];

  return (
    <dl className="space-y-1.5">
      {rows.map(({ icon: Icon, value }) => (
        <div key={value} className="flex items-center gap-2 text-[11px] text-foreground/55">
          <Icon aria-hidden="true" size={13} strokeWidth={1.7} className="shrink-0" />
          <dd className="truncate">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const SECTION_LABELS: Record<string, string> = {
  "프로젝트 개요": "요약",
  "개발 배경 및 필요성": "배경",
  "주요 기능": "주요 기능",
  "담당 역할 및 기여": "기여",
  "시스템 아키텍처": "아키텍처",
  ERD: "ERD",
  "기술적 고민 및 문제 해결": "문제 해결",
  "협업 방식": "협업",
  "관련 링크": "링크",
};

/** Markdown h2에 문서 안에서만 유효한 앵커를 붙이고 상단 목차 데이터를 만든다. */
function prepareProjectHtml(project: Project) {
  const sections: { id: string; label: string }[] = [];
  let index = 0;

  const html = project.html.replace(
    /<h2>([\s\S]*?)<\/h2>/g,
    (heading, headingHtml: string) => {
      const title = headingHtml.replace(/<[^>]+>/g, "").trim();
      if (!title) return heading;

      const id = `project-${project.slug}-section-${index}`;
      index += 1;
      sections.push({ id, label: SECTION_LABELS[title] ?? title });
      return `<h2 id="${id}">${headingHtml}</h2>`;
    },
  );

  return { html, sections };
}

function ProjectFacts({ project }: { project: Project }) {
  const facts = [
    { label: "Role", icon: UserCog, value: project.role },
    { label: "Timeline", icon: CalendarDays, value: project.period },
    { label: "Team", icon: Users, value: project.team },
  ];

  return (
    <dl className="grid grid-cols-2 gap-2 @[26rem]:grid-cols-3 @[48rem]:grid-cols-1">
      {facts.map(({ label, icon: Icon, value }) => (
        <div
          key={label}
          className="rounded-xl border border-ink/10 bg-ink/4 px-3.5 py-3"
        >
          <dt className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-label">
            <Icon aria-hidden="true" size={12} strokeWidth={1.8} />
            {label}
          </dt>
          <dd className="mt-1.5 text-[13px] font-medium leading-snug text-foreground/85">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectsSection({
  projects,
  onOpen,
  ...frame
}: {
  projects: Project[];
  onOpen: (slug: string) => void;
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
}) {
  return (
    <WindowFrame title="projects" defaultWidth={1080} defaultHeight={840} {...frame}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-7 sm:p-8"
      >
        <motion.p
          variants={item}
          className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-label"
        >
          <span className="h-px w-6 bg-label/50" />
          Projects
        </motion.p>

        <motion.p variants={item} className="mt-4 text-sm text-foreground/55">
          카드를 누르면 새 창에서 자세히 볼 수 있습니다.
        </motion.p>

        {/* 브라우저가 아니라 창 폭 기준으로 열 수가 늘어난다. 1열 → 576px 2열 → 1152px 3열 → 1536px 4열 */}
        <div className="mt-6 grid grid-cols-1 gap-4 @xl:grid-cols-2 @[72rem]:grid-cols-3 @[96rem]:grid-cols-4">
          {projects.map((project) => (
            <motion.button
              key={project.slug}
              variants={item}
              type="button"
              onClick={() => onOpen(project.slug)}
              className={`group cursor-pointer rounded-xl border border-ink/10 bg-ink/4 p-3.5 text-left transition-colors hover:border-accent/45 hover:bg-ink/8 focus-visible:border-accent/45 focus-visible:outline-none ${
                project.featured ? "@xl:col-span-2" : ""
              }`}
            >
              <Thumb project={project} />

              <h3 className="mt-3.5 flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                {project.featured ? (
                  <Star
                    aria-label="대표 프로젝트"
                    size={13}
                    strokeWidth={2}
                    className="shrink-0 fill-accent/30 text-accent"
                  />
                ) : null}
                {project.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/55">
                {project.tagline}
              </p>

              <div className="mt-3 border-t border-ink/8 pt-3">
                <Meta project={project} />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <TechBadge key={tech} label={tech} />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </WindowFrame>
  );
}

/** 문서 창의 탭 하나에 들어가는 본문. 창 껍데기는 바깥에서 씌운다. */
export function ProjectDoc({ project }: { project: Project }) {
  const prepared = prepareProjectHtml(project);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="pb-16"
    >
      <motion.header
        variants={item}
        className="m-4 grid gap-6 rounded-2xl border border-ink/10 bg-ink/3 p-5 sm:m-6 sm:p-6 @[48rem]:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.28fr)] @[48rem]:items-center"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-label">
            <span className="h-px w-5 bg-label/55" />
            Project case study
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-foreground @[48rem]:text-[2rem]">
            {project.name}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/65">
            {project.tagline}
          </p>

          <div className="mt-5">
            <ProjectFacts project={project} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <TechBadge key={tech} label={tech} />
            ))}
          </div>

          {project.links.length > 0 ? (
            <div className="mt-4">
              <LinkButtons links={project.links} />
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          {project.screens.length > 0 ? (
            <ProjectCarousel key={project.slug} screens={project.screens} />
          ) : (
            <Thumb project={project} />
          )}
        </div>
      </motion.header>

      {prepared.sections.length > 0 ? (
        <motion.nav
          variants={item}
          aria-label="프로젝트 문서 목차"
          className="sticky top-0 z-20 mt-6 flex gap-1 overflow-x-auto border-y border-ink/10 bg-surface/95 px-4 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {prepared.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] text-foreground/55 transition-colors hover:bg-ink/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {section.label}
            </a>
          ))}
        </motion.nav>
      ) : null}

      {/* 저장소의 Markdown을 읽기 폭이 제한된 케이스 스터디 본문으로 표시한다. */}
      <motion.div
        variants={item}
        className={`${styles.prose} mx-auto max-w-[720px] px-5 sm:px-7`}
        dangerouslySetInnerHTML={{ __html: prepared.html }}
      />
    </motion.div>
  );
}
