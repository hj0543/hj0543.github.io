import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { DevlogPost } from "@/components/devlog-doc";
import HomeDevlogList from "@/components/home-devlog-list";
import { caseRows, type Project } from "@/components/project-doc";
import { BlurText, FadeContent, ScrollReveal, SpotlightCard } from "@/components/react-bits/home-effects";
import { readDevlogPosts, readProjects } from "@/lib/content";
import { career, certificationLogo, certifications, profile } from "@/lib/profile";

import styles from "./home.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
/** "5인 팀 (FE 2, ...)" → "5인", 숫자가 없으면 원문("개인") 그대로. */
const headcount = (team: string) => team.match(/\d+인/)?.[0] ?? team;

/**
 * 경력 로고 배지. 로고는 흰 바탕에 맞춰 만든 것이 많아 다크 모드에서도 흰 배지를 유지한다.
 * 로고가 없는 항목은 건물 아이콘으로 대신한다.
 */
function CareerBadge({ title, logo }: { title: string; logo?: string }) {
  return (
    <span className="relative grid h-11 w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgb(29_28_25/0.08),0_1px_2px_rgb(29_28_25/0.06)]">
      {logo ? (
        <Image src={logo} alt={`${title} 로고`} fill sizes="68px" className="object-contain p-2" />
      ) : (
        <Building2 aria-hidden="true" size={20} strokeWidth={1.7} className="text-[#9b4d2f]" />
      )}
    </span>
  );
}

/** 섹션 위의 영문 라벨. "Selected Work / 01"이면 앞은 이탤릭 세리프, " / " 뒤는 작은 모노로 쓴다. */
function Eyebrow({ children }: { children: string }) {
  const [label, ...rest] = children.split(" / ");
  return (
    <p className="flex items-baseline gap-2.5 text-label">
      <span className="section-label">{label}</span>
      {rest.length ? (
        <span className="font-mono text-[12px] tracking-[0.05em] text-foreground/65">
          / {rest.join(" / ")}
        </span>
      ) : null}
    </p>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-ink/15 pb-20 pt-12">
      <FadeContent className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[1.75rem] font-bold tracking-[-0.025em] text-foreground sm:text-[2rem]">
            <ScrollReveal text={title} />
          </h2>
        </div>
      </FadeContent>
      <div className="mt-10">{children}</div>
    </section>
  );
}

/**
 * 첫 화면. 프로필 사진 | 제목·소개, 그 아래 Background 줄에 경력·자격을 늘어놓는다.
 * 일하는 방식(01 · 02 · 03)은 아래 HOW I WORK가 맡으므로 여기서는 반복하지 않는다.
 */
function Hero() {
  const rows = [
    ...career.map((entry) => ({
      title: entry.title,
      role: entry.role,
      period: entry.period,
      details: entry.details,
      logo: "logo" in entry ? entry.logo : undefined,
    })),
    {
      title: "Certificates",
      role: "자격",
      period: "",
      details: certifications,
      logo: certificationLogo,
    },
  ];
  return (
    <section id="about" className="scroll-mt-20 pb-20 pt-12 sm:pt-16">
      {/* 표지처럼 맨 위에 이름 줄을 긋는다. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3 border-b border-ink/15 pb-3">
        <Eyebrow>{`${profile.name} / Portfolio`}</Eyebrow>
        <p className="shrink-0 text-[12px] text-foreground/65">{profile.location}</p>
      </div>

      {/* 사진은 왼쪽, 제목·소개는 오른쪽에 두고 세로 가운데에 맞춘다. */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center lg:gap-16">
        {/* 사진은 자르지 않고 원본 비율(3:4) 그대로 보여 준다. 좁은 화면에서는 소개 아래로 내린다. */}
        <FadeContent delay={0.15} className="w-full max-w-[280px] max-lg:order-last">
          <figure className={styles.portrait}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface">
              <Image
                src={profile.photo}
                alt={`${profile.nameKo} 프로필 사진`}
                fill
                priority
                sizes="280px"
                className="object-cover"
              />
            </div>
            <figcaption className={styles.portraitCaption}>
              <p className="text-[17px] font-bold tracking-[-0.02em] text-foreground">
                {profile.nameKo}
                <span className="ml-2 text-[13px] font-medium text-foreground/65">
                  {profile.name}
                </span>
              </p>
              <p className="mt-1 text-[12px] text-foreground/70">
                {profile.facts.map(([label, value]) => `${label} ${value}`).join(" · ")}
              </p>
              <p className="mt-4 font-serif text-[16px] italic text-accent">{profile.role}</p>
            </figcaption>
          </figure>
        </FadeContent>

        <div>
          {/* 첫 줄은 진하게, 둘째 줄은 회색으로 두고 강조어만 accent로 칠한다. */}
          <h1 className="text-[2.25rem] font-bold leading-[1.18] tracking-[-0.03em] text-foreground sm:text-[3.5rem]">
            <BlurText text={profile.headline[0]} />
            <br />
            <BlurText text={profile.headline[1]} delay={0.2} className="text-accent" />
            <BlurText text={profile.headline[2]} delay={0.38} className="text-foreground/60" />
          </h1>
          <FadeContent delay={0.2}>
            <p className="mt-8 max-w-[560px] text-[16px] leading-7 text-foreground/75 sm:text-[17px] sm:leading-[30px]">
              {profile.intro.map((line) => (
                <span key={line} className="sm:block">
                  {line}{" "}
                </span>
              ))}
            </p>
          </FadeContent>
        </div>
      </div>

      <FadeContent className="mt-16 border-t border-ink/15 pt-10">
        <Eyebrow>Background</Eyebrow>
        <ol className="mt-7 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => (
            <li
              key={row.title}
              className="min-w-0 sm:odd:pr-6 sm:even:border-l sm:even:border-ink/15 sm:even:pl-6 lg:border-l lg:border-ink/15 lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="flex items-center gap-3.5">
                <CareerBadge title={row.title} logo={row.logo} />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold leading-6 text-foreground">
                    {row.title}
                  </p>
                  {row.role ? (
                    <p className="truncate text-[14px] leading-6 text-foreground/65">{row.role}</p>
                  ) : null}
                </div>
              </div>
              {row.period ? (
                <p className="mt-4 font-mono text-[12px] tabular-nums text-accent">{row.period}</p>
              ) : null}
              <ul
                className={`${row.period ? "mt-2" : "mt-4"} space-y-1 text-[14px] leading-6 text-foreground/75`}
              >
                {row.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </FadeContent>
    </section>
  );
}

/** 이미지가 없을 때 쓰는 자리표시. 이름 머리글자를 크게 둔다. */
function Placeholder({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <span
      className={`absolute inset-0 flex items-center justify-center font-bold tracking-[-0.05em] text-foreground/25 ${
        large ? "text-6xl" : "text-3xl"
      }`}
    >
      {large ? project.name : project.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** 대표 이미지 모서리에 걸치는 작은 원형 수상 도장. accent로 채워 패널 위에서 도드라지게 하고, 테두리 글자가 천천히 돈다. */
function AwardSeal({ year }: { year: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute -right-2.5 -top-2.5 size-20 rounded-full bg-accent text-on-accent shadow-[0_8px_20px_-8px_rgb(29_28_25/0.45)] sm:-right-4 sm:-top-4 sm:size-[5.5rem]"
    >
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 animate-[spin_24s_linear_infinite] motion-reduce:animate-none"
      >
        <defs>
          <path id="award-ring" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
        </defs>
        <text className="fill-current text-[11px] font-semibold uppercase" letterSpacing="0.16em">
          <textPath href="#award-ring" textLength="290" lengthAdjust="spacing">
            {`Project Award · SSAFY ${year} · `}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-current/40">
        <Trophy size={15} strokeWidth={2} />
        <span className="mt-0.5 text-[10px] font-bold tracking-[-0.02em]">우수상</span>
      </span>
    </div>
  );
}

/** 색상 패널 안에 썸네일 전체를 보여 주는 작품집 이미지. */
function ProjectArtwork({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <div
      data-project={project.slug}
      className={`${styles.projectPanel} ${featured ? styles.featuredPanel : ""}`}
    >
      <div className={styles.projectImage}>
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt=""
            fill
            sizes={featured ? "(max-width: 1024px) 85vw, 520px" : "(max-width: 640px) 80vw, 440px"}
            className="object-contain transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          <Placeholder project={project} large={featured} />
        )}
      </div>
    </div>
  );
}

/** 대표 작업: 넓은 화면에서는 왼쪽 이미지, 오른쪽 소개·문제·결과. */
function FeaturedProject({ project }: { project: Project }) {
  const href = `/projects/${project.slug}`;

  return (
    <article>
      <FadeContent className={`${styles.projectMeta} mb-5`}>
        <span>01 / FEATURED WORK</span>
        <span>{[project.period, headcount(project.team)].filter(Boolean).join(" · ")}</span>
      </FadeContent>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
        <FadeContent className="relative">
          <Link
            href={href}
            aria-label={`${project.name} 자세히 보기`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <ProjectArtwork project={project} featured />
          </Link>
          {project.award ? <AwardSeal year={project.period.slice(0, 4)} /> : null}
        </FadeContent>

        <FadeContent delay={0.1} className="min-w-0">
          <h3 className="text-[2.75rem] font-bold tracking-[-0.03em] text-foreground sm:text-[3.5rem]">
            {project.name}
          </h3>
          <p className="mt-2 text-[17px] leading-7 text-foreground/75">{project.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.award ? (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-4 py-1.5 text-[13px] font-semibold text-accent">
                <Trophy aria-hidden="true" size={14} strokeWidth={2} />
                {project.award}
              </p>
            ) : null}
            <p className="rounded-full bg-accent-soft px-4 py-1.5 text-[13px] font-medium text-accent">
              {project.role}
            </p>
          </div>

          <dl className="mt-8 border-b border-ink/15">
            {caseRows(project).map(([label, value]) => (
              <div key={label} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-ink/15 py-6 text-[15px] leading-8">
                <dt className={`font-bold ${label === "결과" ? "text-accent" : "text-foreground"}`}>{label}</dt>
                <dd className="text-foreground/75">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={href}
            className="mt-8 inline-flex items-center gap-1.5 border-b border-accent/60 pb-1 text-[15px] font-medium text-accent transition-colors hover:border-accent"
          >
            프로젝트 자세히 보기
            <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </FadeContent>
      </div>
    </article>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <li>
      <FadeContent delay={(index % 2) * 0.08} className="h-full">
        <SpotlightCard>
          <Link href={`/projects/${project.slug}`} className="group flex h-full flex-col p-4 sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
            <div className={`${styles.projectMeta} mb-4`}>
              <span>{pad(index + 2)} / PROJECT</span>
              <span>{[project.period.slice(0, 4), headcount(project.team)].filter(Boolean).join(" · ")}</span>
            </div>
            <ProjectArtwork project={project} />
            <h3 className="mt-5 text-xl font-bold tracking-[-0.03em] text-foreground transition-colors group-hover:text-accent">
              {project.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[14px] leading-6 text-foreground/70">
              {project.tagline}
            </p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <span className="truncate rounded-full bg-ink/6 px-3 py-1.5 text-[12px] text-foreground/75">
                {project.role}
              </span>
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/30 text-foreground transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent"
              >
                <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </SpotlightCard>
      </FadeContent>
    </li>
  );
}

function HomeNoteLink({ post }: { post: DevlogPost }) {
  const tags = post.tags.filter((tag) => tag.trim().toUpperCase() !== "SSAFY").slice(0, 2);

  return (
    <Link href={`/devlog/${post.slug}`} className={styles.noteLink}>
      <h3 className={styles.noteTitle}>{post.title}</h3>
      <div className={styles.noteMeta}>
        {tags.length > 0 ? <span className={styles.noteTags}>{tags.join(" · ")}</span> : null}
        <time dateTime={post.date} className={styles.noteDate}>
          {post.date.replaceAll("-", ".")}
        </time>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [posts, projects] = await Promise.all([readDevlogPosts(), readProjects()]);
  const featured = projects.find((project) => project.featured);
  const rest = projects.filter((project) => project !== featured);

  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
      <Hero />

      <Section id="projects" eyebrow="Selected Work / 01" title="경험으로 보여드립니다.">
        {featured ? <FeaturedProject project={featured} /> : null}
        <ul className="mt-20 grid gap-x-8 gap-y-10 border-t border-ink/15 pt-12 sm:grid-cols-2 sm:mt-24">
          {rest.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </ul>
      </Section>

      <Section id="devlog" eyebrow="Notes / 02" title="만들며 남긴 기록">
        {posts.length === 0 ? (
          <p className="text-sm text-foreground/70">아직 작성한 글이 없습니다.</p>
        ) : (
          <FadeContent className="-mt-2 max-w-[800px]">
            <HomeDevlogList
              items={posts.map((post) => (
                <li
                  key={post.slug}
                  className="min-w-0"
                >
                  <HomeNoteLink post={post} />
                </li>
              ))}
            />
          </FadeContent>
        )}
      </Section>
    </div>
  );
}
