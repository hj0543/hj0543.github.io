import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Tag, type DevlogPost } from "@/components/devlog-doc";
import { Thumb, type Project } from "@/components/project-doc";
import { TechBadge } from "@/components/ui/brand-icon";
import { readDevlogPosts, readProjects } from "@/lib/content";
import {
  career,
  certifications,
  highlights,
  profile,
  skillGroups,
} from "@/lib/profile";

/** 번호·라벨·제목이 같은 문법을 쓰는 홈 섹션 틀. */
function Section({
  id,
  index,
  eyebrow,
  title,
  count,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-14 border-t border-ink/8 py-16 sm:py-24"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] tracking-[0.2em] text-label">
            {index} · {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
            {title}
          </h2>
        </div>
        {count !== undefined ? (
          <span className="font-mono text-[12px] tabular-nums text-foreground/60">
            {String(count).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Hero() {
  return (
    <section className="grid gap-12 pb-20 pt-16 sm:pt-24 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-label">
          {profile.role}
        </p>
        <h1 className="mt-5 text-[2.5rem] font-bold leading-[1.15] tracking-[-0.045em] text-foreground sm:text-[3.4rem]">
          {profile.headline[0]}
          <br />
          {profile.headline[1]}
        </h1>
        <p className="mt-6 max-w-[560px] text-[17px] leading-8 text-foreground/65">
          {profile.intro}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#projects"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            프로젝트 보기 <span aria-hidden="true" className="ml-2">↘</span>
          </Link>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/15 px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            연락하기
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="rounded-full border border-ink/10 bg-surface px-3.5 py-1.5 text-[13px] text-foreground/70"
            >
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-2xl border border-ink/8 bg-surface p-6">
        <div className="relative size-20 overflow-hidden rounded-full border border-ink/10">
          {/* 원본 사진이 상반신이라 얼굴 쪽으로 확대해 자른다. */}
          <Image
            src={profile.photo}
            alt={`${profile.name} 프로필 사진`}
            width={2160}
            height={2160}
            sizes="80px"
            className="h-[180%] w-[180%] max-w-none -translate-x-[22.222%] object-cover object-top"
          />
        </div>
        <p className="mt-5 text-lg font-bold tracking-[-0.02em] text-foreground">
          {profile.name}
        </p>
        <p className="mt-1 text-sm text-foreground/55">SSAFY 15th</p>
        <p className="mt-4 flex items-center gap-1.5 text-[13px] text-foreground/55">
          <MapPin aria-hidden="true" size={14} strokeWidth={1.7} />
          {profile.location}
        </p>
        <div className="mt-6 flex gap-2 border-t border-ink/8 pt-5">
          <a
            href={`mailto:${profile.email}`}
            className="flex-1 rounded-full bg-accent py-2 text-center text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Email
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-ink/15 py-2 text-center text-[13px] font-semibold text-foreground/80 transition-colors hover:border-accent/50 hover:text-accent"
          >
            GitHub ↗
          </a>
        </div>
      </aside>
    </section>
  );
}

/** 첫 프로젝트는 크게, 나머지는 격자로 보여준다. 순서는 frontmatter의 order를 따른다. */
function ProjectList({ projects }: { projects: Project[] }) {
  const [featured, ...rest] = projects;
  if (!featured) return null;

  return (
    <>
      <Link
        href={`/projects/${featured.slug}`}
        className="group grid gap-6 rounded-2xl border border-ink/8 bg-surface p-4 transition-colors hover:border-accent/40 sm:p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:gap-10"
      >
        <Thumb project={featured} />
        <div className="md:pr-4">
          <p className="font-mono text-[11px] tracking-[0.18em] text-label">
            FEATURED
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-foreground transition-colors group-hover:text-accent">
            {featured.name}
          </h3>
          <p className="mt-3 text-[15px] leading-7 text-foreground/60">
            {featured.tagline}
          </p>
          {featured.problem ? (
            <p className="mt-5 text-sm leading-6 text-foreground/75">
              <span className="mr-2 font-mono text-[11px] font-semibold text-label">문제</span>
              {featured.problem}
            </p>
          ) : null}
          {featured.result ? (
            <p className="mt-2 text-sm leading-6 text-foreground/75">
              <span className="mr-2 font-mono text-[11px] font-semibold text-label">결과</span>
              {featured.result}
            </p>
          ) : null}
          <dl className="mt-6 grid gap-2 text-[13px]">
            {[
              ["Role", featured.role],
              ["Period", featured.period],
            ].map(([label, value]) =>
              value ? (
                <div key={label} className="flex gap-4">
                  <dt className="w-14 shrink-0 font-mono text-[12px] leading-5 text-foreground/60">
                    {label}
                  </dt>
                  <dd className="text-foreground/75">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <p className="mt-6 text-sm font-semibold text-accent">
            자세히 보기 →
          </p>
        </div>
      </Link>

      {rest.length > 0 ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-ink/8 p-3.5 transition-colors hover:border-accent/40 hover:bg-surface"
              >
                <Thumb project={project} />
                <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
                  <h3 className="text-[17px] font-bold tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent">
                    {project.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/60">
                    {project.tagline}
                  </p>
                  {project.problem ? (
                    <p className="mt-4 line-clamp-2 text-[13px] leading-5 text-foreground/75">
                      <span className="mr-1.5 font-semibold text-label">문제</span>
                      {project.problem}
                    </p>
                  ) : null}
                  {project.result ? (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-foreground/75">
                      <span className="mr-1.5 font-semibold text-label">결과</span>
                      {project.result}
                    </p>
                  ) : null}
                  {project.period ? (
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 text-[12px] text-foreground/65">
                      <span className="font-medium">{project.role}</span>
                      <span className="font-mono tabular-nums">{project.period}</span>
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function DevlogList({ posts }: { posts: DevlogPost[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-foreground/50">아직 작성한 글이 없습니다.</p>;
  }

  return (
    <ul className="border-t border-ink/8">
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-ink/8">
          <Link
            href={`/devlog/${post.slug}`}
            className="group grid gap-2 py-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-8"
          >
            <span className="flex items-center gap-1.5 font-mono text-[12px] text-foreground/65 sm:pt-1">
              <CalendarDays aria-hidden="true" size={13} strokeWidth={1.7} />
              {post.date}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              {post.summary ? (
                <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-foreground/60">
                  {post.summary}
                </p>
              ) : null}
              {post.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function About() {
  return (
    <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <ol className="border-l border-ink/12">
        {career.map((entry) => (
          <li key={entry.title} className="relative pb-10 pl-7 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-2 size-[9px] rounded-full border-2 border-background bg-accent"
            />
            <p className="font-mono text-[12px] tabular-nums text-foreground/65">
              {entry.period}
            </p>
            <h3 className="mt-1.5 text-[17px] font-bold tracking-[-0.02em] text-foreground">
              {entry.title}
              {entry.role ? (
                <span className="ml-2 text-sm font-normal text-foreground/50">
                  {entry.role}
                </span>
              ) : null}
            </h3>
            <ul className="mt-2 space-y-1">
              {entry.details.map((detail) => (
                <li key={detail} className="text-[15px] leading-7 text-foreground/65">
                  {detail}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="space-y-10">
        <div>
          <h3 className="font-mono text-[12px] tracking-[0.16em] text-foreground/65">
            TOOLBOX
          </h3>
          <dl className="mt-4 divide-y divide-ink/8 border-y border-ink/8">
            {skillGroups.map((group) => (
              <div key={group.title} className="py-4">
                <dt className="text-[13px] font-semibold text-foreground/80">
                  {group.title}
                </dt>
                <dd className="mt-2.5 flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <TechBadge key={skill} label={skill} />
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="font-mono text-[12px] tracking-[0.16em] text-foreground/65">
            CERTIFIED
          </h3>
          <ul className="mt-4 space-y-1">
            {certifications.map((certification) => (
              <li key={certification} className="text-[15px] text-foreground/70">
                {certification}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const [posts, projects] = await Promise.all([
    readDevlogPosts(),
    readProjects(),
  ]);

  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
      <Hero />

      <Section
        id="projects"
        index="01"
        eyebrow="PROJECTS"
        title="프로젝트"
        count={projects.length}
      >
        <ProjectList projects={projects} />
      </Section>

      <Section
        id="devlog"
        index="02"
        eyebrow="DEVLOG"
        title="개발 기록"
        count={posts.length}
      >
        <DevlogList posts={posts} />
      </Section>

      <Section id="about" index="03" eyebrow="BACKGROUND" title="경력과 기술">
        <About />
      </Section>
    </div>
  );
}
