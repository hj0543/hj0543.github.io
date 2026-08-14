"use client";

import {
  CalendarDays,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";

import { TechBadge } from "@/components/ui/brand-icon";
import CountUp from "@/components/ui/count-up";
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
  /** 이 프로젝트에서 직접 맡은 핵심 영역. */
  responsibilities: string[];
  /** 팀 프로젝트 내 기여도. 0~100 사이의 백분율. */
  contribution?: number;
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

/** 문서 상단의 GitHub·배포 링크. 본문 링크와 같은 간결한 형태로 표시한다. */
function LinkButtons({ links }: { links: Project["links"] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {links.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="group/link inline-flex items-center gap-1 border-b border-ink/25 pb-0.5 text-[13px] text-foreground/75 transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {label}
          <span
            aria-hidden="true"
            className="text-[11px] transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
          >
            ↗
          </span>
        </a>
      ))}
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
    { label: "역할", value: project.role },
    { label: "기간", value: project.period },
    { label: "구성", value: project.team },
    ...(project.contribution === undefined
      ? []
      : [
          {
            label: "기여도",
            value: (
              <span className="font-mono font-semibold tabular-nums text-accent">
                <CountUp to={project.contribution} duration={1.4} />%
              </span>
            ),
          },
        ]),
  ];

  return (
    <dl className="grid border-y border-ink/12 py-2 @[34rem]:grid-cols-4 @[34rem]:gap-x-6 @[34rem]:py-0 @[48rem]:grid-cols-1 @[48rem]:gap-x-0 @[48rem]:py-2">
      {facts.map(({ label, value }) => (
        <div
          key={label}
          className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-3 py-2 @[34rem]:block @[34rem]:py-3.5 @[48rem]:grid @[48rem]:py-2"
        >
          <dt className="font-mono text-[10px] tracking-[0.12em] text-foreground/40">
            {label}
          </dt>
          <dd className="text-[13px] leading-relaxed text-foreground/80">{value}</dd>
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
        className="mx-auto grid max-w-[1020px] gap-8 px-5 pb-10 pt-12 sm:px-8 sm:pt-16 @[48rem]:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.28fr)] @[48rem]:items-start"
      >
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-foreground @[48rem]:text-[2rem]">
            {project.name}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-foreground/60">
            {project.tagline}
          </p>

          <div className="mt-9">
            <ProjectFacts project={project} />
          </div>

          {project.responsibilities.length > 0 ||
          project.stack.length > 0 ||
          project.links.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {project.responsibilities.length > 0 ? (
                <div className="flex min-w-0 items-baseline gap-4">
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-foreground/40">
                    담당
                  </span>
                  <p className="text-[13px] leading-relaxed text-foreground/70">
                    {project.responsibilities.join(" · ")}
                  </p>
                </div>
              ) : null}

              {project.stack.length > 0 ? (
                <div className="flex min-w-0 items-start gap-4">
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-foreground/40">
                    기술
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <TechBadge key={tech} label={tech} />
                    ))}
                  </div>
                </div>
              ) : null}

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
          className="sticky top-0 z-20 mt-12 overflow-x-auto border-y border-ink/10 bg-surface/95 backdrop-blur-xl [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto flex h-10 w-max min-w-full max-w-[920px] items-center gap-6 px-5 sm:px-8">
            <span className="flex h-5 shrink-0 items-center border-r border-ink/12 pr-5 font-mono text-[14px] leading-none tracking-[0.14em] text-foreground/35">
              목차
            </span>
            {prepared.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex h-full shrink-0 items-center font-mono text-[14px] leading-none text-foreground/50 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                {section.label}
              </a>
            ))}
          </div>
        </motion.nav>
      ) : null}

      {/* 저장소의 Markdown을 읽기 폭이 제한된 케이스 스터디 본문으로 표시한다. */}
      <motion.div
        variants={item}
        className={`${styles.prose} mx-auto max-w-[760px] px-5 sm:px-8`}
        dangerouslySetInnerHTML={{ __html: prepared.html }}
      />
    </motion.div>
  );
}
