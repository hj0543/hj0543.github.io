import Image from "next/image";

import { TechBadge } from "@/components/ui/brand-icon";
import CountUp from "@/components/ui/count-up";
import ProjectCarousel, {
  type ProjectScreen,
} from "@/components/ui/project-carousel";

import Link from "next/link";

import styles from "./doc-prose.module.css";

export type Project = {
  /** 확장자를 뗀 파일 이름. 상세 페이지 주소에 그대로 쓴다. */
  slug: string;
  name: string;
  tagline: string;
  /** 대표 프로젝트. 홈 목록 맨 위에 배치한다. */
  featured: boolean;
  problem?: string;
  result?: string;
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
  /** 빌드할 때 마크다운을 변환해 둔 본문. */
  html: string;
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
export function Thumb({ project }: { project: Project }) {
  return (
    <div className="relative aspect-video overflow-hidden border border-ink/10 bg-linear-to-br from-surface to-accent/10">
      {project.thumbnail ? (
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 320px"
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
          <span className="font-mono text-3xl font-semibold tracking-[-0.05em] text-accent/70">
            {project.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-xs font-medium text-foreground/60">{project.name}</span>
        </div>
      )}
    </div>
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
          <dt className="font-mono text-[11px] tracking-[0.12em] text-foreground/65">
            {label}
          </dt>
          <dd className="text-[13px] leading-relaxed text-foreground/80">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 프로젝트 상세 페이지 본문. 페이지 껍데기는 바깥에서 씌운다. */
export function ProjectDoc({ project }: { project: Project }) {
  const prepared = prepareProjectHtml(project);

  return (
    <div className="pb-16">
      <header className="mx-auto grid max-w-[1080px] gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pt-10 @[48rem]:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.28fr)] @[48rem]:items-start">
        <div className="min-w-0">
          <Link
            href="/#projects"
            className="font-mono text-[12px] text-foreground/50 transition-colors hover:text-accent"
          >
            ← Projects
          </Link>
          <div className="mt-8" />
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-foreground @[48rem]:text-[2rem]">
            {project.name}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-foreground/60">
            {project.tagline}
          </p>

          {project.problem || project.result ? (
            <dl className="mt-7 grid gap-3 border-t border-ink/10 pt-5 text-sm leading-6">
              {project.problem ? (
                <div>
                  <dt className="font-mono text-[11px] tracking-[0.1em] text-label">문제</dt>
                  <dd className="mt-1 text-foreground/75">{project.problem}</dd>
                </div>
              ) : null}
              {project.result ? (
                <div>
                  <dt className="font-mono text-[11px] tracking-[0.1em] text-label">결과</dt>
                  <dd className="mt-1 text-foreground/75">{project.result}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-9">
            <ProjectFacts project={project} />
          </div>

          {project.responsibilities.length > 0 ||
          project.stack.length > 0 ||
          project.links.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {project.responsibilities.length > 0 ? (
                <div className="flex min-w-0 items-baseline gap-4">
                  <span className="shrink-0 font-mono text-[11px] tracking-[0.12em] text-foreground/65">
                    담당
                  </span>
                  <p className="text-[13px] leading-relaxed text-foreground/70">
                    {project.responsibilities.join(" · ")}
                  </p>
                </div>
              ) : null}

              {project.stack.length > 0 ? (
                <div className="flex min-w-0 items-start gap-4">
                  <span className="shrink-0 font-mono text-[11px] tracking-[0.12em] text-foreground/65">
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
      </header>

      {prepared.sections.length > 0 ? (
        <nav
          aria-label="프로젝트 문서 목차"
          className="sticky top-14 z-20 mt-12 overflow-x-auto border-y border-ink/10 bg-background/90 backdrop-blur-md [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto flex h-10 max-w-[1080px] items-center gap-6 px-5 sm:px-8">
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
        </nav>
      ) : null}

      {/* 저장소의 Markdown을 읽기 폭이 제한된 케이스 스터디 본문으로 표시한다. */}
      <div
        className={`${styles.prose} mx-auto max-w-[760px] px-5 sm:px-8`}
        dangerouslySetInnerHTML={{ __html: prepared.html }}
      />
    </div>
  );
}
