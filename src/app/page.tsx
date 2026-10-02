import Image from "next/image";
import Link from "next/link";

import type { DevlogPost } from "@/components/devlog-doc";
import { Thumb, type Project } from "@/components/project-doc";
import { TechBadge } from "@/components/ui/brand-icon";
import { readDevlogPosts, readProjects } from "@/lib/content";
import {
  career,
  certifications,
  profile,
  skillGroups,
} from "@/lib/profile";

const pad = (n: number) => String(n).padStart(2, "0");

// 문서 판번호. 빌드한 달로 찍힌다.
const revision = new Date().toISOString().slice(0, 7).replace("-", ".");

/** 문서의 한 장(§). 넓은 화면에서는 장 번호가 왼쪽 여백에 붙는다. */
function Section({
  id,
  index,
  eyebrow,
  title,
  count,
  children,
}: {
  id: string;
  index: number;
  eyebrow: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="grid scroll-mt-14 gap-6 border-t-2 border-ink py-14 sm:py-20 md:grid-cols-[140px_minmax(0,1fr)] md:gap-10"
    >
      {/* 넓은 화면에서는 장 번호가 섹션 끝까지 헤더 아래에 따라온다. */}
      <div className="md:sticky md:top-20 md:self-start">
        <p className="font-mono text-3xl font-semibold text-label">§{index}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/55">
          {eyebrow}
        </p>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-4">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
            {title}
          </h2>
          {count !== undefined ? (
            <span className="font-mono text-[12px] tabular-nums text-foreground/55">
              {pad(count)}건
            </span>
          ) : null}
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </section>
  );
}

/** 표지: 문서 머리줄 → 제목 → 증명사진·연락 | 경력·기술·자격 → 목차. */
function Cover({ toc }: { toc: { id: string; title: string; count?: number }[] }) {
  const meta: [string, React.ReactNode][] = [
    [
      "경력",
      // 세로선 타임라인. 맨 위(진행 중) 항목만 점을 주홍으로 칠하고, 나머지는 마우스를 대면 강조한다.
      <ol key="career" className="border-l border-ink/20">
        {career.map((entry, i) => (
          <li key={entry.title} className="group/career relative pb-4 pl-5 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute left-[-4.5px] top-2 size-2 transition-colors duration-300 ${
                i === 0 ? "bg-accent" : "bg-ink/30 group-hover/career:bg-accent"
              }`}
            />
            <p>
              <span className="font-semibold text-foreground transition-colors duration-300 group-hover/career:text-accent">
                {entry.title}
              </span>
              {entry.role ? <span className="ml-1.5 text-foreground/55">{entry.role}</span> : null}
              <span className="ml-2 font-mono text-[11px] tabular-nums text-foreground/50">
                {entry.period}
              </span>
            </p>
            <ul className="text-[13px] text-foreground/60">
              {entry.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>,
    ],
    [
      "기술",
      <div key="skills" className="space-y-3">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[12px] text-foreground/55">{group.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <TechBadge key={skill} label={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>,
    ],
    [
      "자격",
      <ul key="certifications">
        {certifications.map((certification) => (
          <li key={certification}>{certification}</li>
        ))}
      </ul>,
    ],
  ];

  return (
    <section id="about" className="scroll-mt-14 pb-16 pt-10 sm:pt-14">
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-y-2 border-ink py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/70">
        <span>Portfolio Document</span>
        <span>Doc No. HJ-2026 · Rev. {revision}</span>
      </div>

      <h1 className="mt-12 text-[2.4rem] font-bold leading-[1.15] tracking-[-0.045em] text-foreground sm:text-[3.4rem]">
        {profile.headline[0]}
        <br />
        {profile.headline[1]}
      </h1>
      <p className="mt-6 max-w-[600px] text-[17px] leading-8 text-foreground/65">
        {profile.intro}
      </p>

      <div className="mt-14 grid gap-10 md:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <Image
            src={profile.photo}
            alt={`${profile.name} 증명사진`}
            width={200}
            height={249}
            sizes="180px"
            className="w-36 border border-ink/20 md:w-full"
          />
          <p className="mt-4 text-lg font-bold tracking-[-0.02em] text-foreground">
            {profile.name}
          </p>
          <dl className="mt-3 grid grid-cols-[44px_minmax(0,1fr)] gap-y-1 text-[13px]">
            {profile.facts.map(([label, value]) => (
              <div key={label} className="col-span-2 grid grid-cols-subgrid">
                <dt className="font-mono text-[12px] text-foreground/50">{label}</dt>
                <dd className="tabular-nums text-foreground/80">{value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="break-all border-b border-accent/50 text-accent hover:border-accent"
              >
                {profile.email}
              </a>
            </li>
            <li>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="border-b border-ink/25 text-foreground/80 hover:border-accent hover:text-accent"
              >
                GitHub ↗
              </a>
            </li>
          </ul>
        </div>
        <dl className="grid grid-cols-[64px_minmax(0,1fr)] content-start border-t border-ink/15 text-sm">
          {meta.map(([label, value]) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid border-b border-ink/10 py-3">
              <dt className="font-mono text-[12px] leading-6 text-foreground/50">{label}</dt>
              <dd className="leading-6 text-foreground/80">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 목차는 프로필 아래에 가로 탭으로 늘어놓는다. */}
      <nav aria-label="목차" className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/55">
          Contents
        </p>
        <ol className="mt-3 flex divide-x divide-ink/15 border-y border-ink/15">
          {toc.map((item, i) => (
            <li key={item.id} className="flex-1">
              <a
                href={`#${item.id}`}
                className="group flex items-baseline gap-3 px-4 py-3.5 text-[15px] transition-colors hover:bg-surface"
              >
                <span className="font-mono text-[12px] text-label">§{i + 1}</span>
                <span className="text-foreground/85 transition-colors group-hover:text-accent">
                  {item.title}
                </span>
                <span className="ml-auto font-mono text-[12px] tabular-nums text-foreground/55">
                  {item.count !== undefined ? pad(item.count) : "—"}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}

function ProblemResult({ project }: { project: Project }) {
  return (
    <dl className="mt-4 grid gap-1.5 text-sm leading-6">
      {project.problem ? (
        <div className="grid grid-cols-[40px_minmax(0,1fr)]">
          <dt className="font-mono text-[11px] font-semibold leading-6 text-foreground/50">문제</dt>
          <dd className="text-foreground/75">{project.problem}</dd>
        </div>
      ) : null}
      <div className="grid grid-cols-[40px_minmax(0,1fr)]">
        <dt className="font-mono text-[11px] font-semibold leading-6 text-label">결과</dt>
        <dd className={project.result ? "text-foreground/75" : "text-foreground/45"}>
          {project.result ?? "진행 중"}
        </dd>
      </div>
    </dl>
  );
}

function ProjectTitle({ project, className }: { project: Project; className: string }) {
  return (
    <h3 className={`${className} font-bold tracking-[-0.025em] text-foreground transition-colors group-hover:text-accent`}>
      {project.name}
      <span aria-hidden="true" className="ml-2 inline-block opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </h3>
  );
}

/**
 * 대표 프로젝트(featured)는 썸네일 | 내용 2분할로 크게, 나머지는 그 아래 한 열로 나열한다.
 * 대표 프로젝트가 맨 위에 오고, 나머지는 frontmatter의 order를 따른다.
 */
function ProjectList({ projects }: { projects: Project[] }) {
  const number = (project: Project) => `P-${pad(projects.indexOf(project) + 1)}`;
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <div>
      {featured.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="group grid gap-x-10 gap-y-6 border-b border-ink/15 py-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center"
        >
          <Thumb project={project} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-mono text-[12px] text-label">
              {number(project)}
              <span className="border border-accent/60 px-1.5 text-[10px] tracking-[0.12em]">대표</span>
            </p>
            <ProjectTitle project={project} className="mt-2 text-2xl leading-9" />
            <p className="mt-1 text-[15px] leading-7 text-foreground/60">{project.tagline}</p>
            <ProblemResult project={project} />
            <ProjectMeta project={project} />
          </div>
        </Link>
      ))}

      <ol>
        {rest.map((project) => (
          <li key={project.slug} className="border-b border-ink/15">
            <Link href={`/projects/${project.slug}`} className="group block h-full py-7">
              <div className="flex items-center gap-4">
                <MiniThumb project={project} />
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-label">{number(project)}</p>
                  <ProjectTitle project={project} className="mt-0.5 text-xl leading-8" />
                </div>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-foreground/60">{project.tagline}</p>
              <ProblemResult project={project} />
              <ProjectMeta project={project} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** 목록용 작은 정사각 썸네일. 이미지가 없으면 이름 머리글자로 채운다. */
function MiniThumb({ project }: { project: Project }) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden border border-ink/15 bg-surface">
      {project.thumbnail ? (
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="56px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold text-accent/70">
          {project.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function ProjectMeta({ project }: { project: Project }) {
  return (
    <p className="mt-4 flex flex-wrap gap-x-3 text-[13px] text-foreground/60">
      <span className="text-foreground/80">{project.role}</span>
      <span className="font-mono text-[12px] tabular-nums">{project.period}</span>
      <span>{project.team}</span>
    </p>
  );
}

function DevlogList({ posts }: { posts: DevlogPost[] }) {
  if (posts.length === 0) {
    return <p className="py-6 text-sm text-foreground/50">아직 작성한 글이 없습니다.</p>;
  }

  return (
    <ol>
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-ink/15">
          <Link
            href={`/devlog/${post.slug}`}
            className="group grid gap-2 py-6 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-8"
          >
            <span className="font-mono text-[12px] leading-7 tabular-nums text-foreground/55">
              {post.date}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold leading-7 tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              {post.summary ? (
                <p className="mt-1.5 line-clamp-2 text-[15px] leading-7 text-foreground/60">
                  {post.summary}
                </p>
              ) : null}
              {post.tags.length > 0 ? (
                <p className="mt-2 font-mono text-[11px] text-foreground/50">
                  {post.tags.map((tag) => `#${tag}`).join("  ")}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function Home() {
  const [posts, projects] = await Promise.all([
    readDevlogPosts(),
    readProjects(),
  ]);

  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
      <Cover
        toc={[
          { id: "projects", title: "프로젝트", count: projects.length },
          { id: "devlog", title: "개발 기록", count: posts.length },
        ]}
      />

      <Section id="projects" index={1} eyebrow="Projects" title="프로젝트" count={projects.length}>
        <ProjectList projects={projects} />
      </Section>

      <Section id="devlog" index={2} eyebrow="Devlog" title="개발 기록" count={posts.length}>
        <DevlogList posts={posts} />
      </Section>
    </div>
  );
}
