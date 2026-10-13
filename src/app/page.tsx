import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { NoteLink } from "@/components/devlog-doc";
import { caseRows, type Project } from "@/components/project-doc";
import { BlurText, FadeContent, ScrollReveal, SpotlightCard } from "@/components/react-bits/home-effects";
import { readDevlogPosts, readProjects } from "@/lib/content";
import { career, certificationLogo, certifications, profile } from "@/lib/profile";

import styles from "./home.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** 홈에 미리 보여 줄 기록 수. 나머지는 /devlog에서 본다. */
const NOTE_PREVIEW = 4;

const PROCESS = [
  {
    title: "문제 발견",
    body: "사용자의 맥락을 깊이 이해하고, 겉으로 보이는 현상 너머의 진짜 문제를 찾습니다.",
  },
  {
    title: "해결 설계",
    body: "문제를 여러 관점에서 검토하고, 실행 가능한 해결 방안을 구체화합니다.",
  },
  {
    title: "구현과 협업",
    body: "기획한 것을 실제로 작동하는 서비스로 만들고, 팀과 함께 끝까지 완성합니다.",
  },
];

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
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
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
        {action}
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
    <section id="about" className={`${styles.hero} scroll-mt-20 pb-20 pt-12 sm:pt-16`}>
      <div aria-hidden="true" className={styles.ambience} />
      {/* 표지처럼 맨 위에 이름 줄을 긋는다. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3 border-b border-ink/15 pb-3">
        <Eyebrow>{`${profile.name} / Portfolio`}</Eyebrow>
        <p className="shrink-0 font-mono text-[12px] text-foreground/65">{profile.location}</p>
      </div>

      {/* 사진은 왼쪽, 제목·소개·버튼은 오른쪽에 묶어 사진 아래쪽 선에 맞춘다. */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-end lg:gap-16">
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

        <div className="lg:pb-2">
          {/* 만든 것은 진하게, 배운 것은 같은 굵기의 회색으로 이어 두 줄이 대비되게 한다. */}
          <h1 className="text-[2.5rem] font-bold leading-[1.18] tracking-[-0.03em] text-foreground sm:text-[3.5rem]">
            <BlurText text={profile.headline[0]} />
            <br />
            <BlurText text={profile.headline[1]} delay={0.2} className="text-foreground/60" />
          </h1>
          <FadeContent delay={0.2}>
            <p className="mt-8 max-w-[560px] text-[16px] leading-7 text-foreground/75 sm:text-[17px] sm:leading-[30px]">
              {profile.intro.map((line) => (
                <span key={line} className="sm:block">
                  {line}{" "}
                </span>
              ))}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <a
                href="#projects"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-[15px] font-semibold text-on-accent transition-colors hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2"
              >
                프로젝트 보기
                <ArrowDownRight aria-hidden="true" size={17} />
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border-b border-foreground/50 pb-1 text-[15px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                GitHub
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
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
                    <p className="truncate text-[13px] leading-5 text-foreground/65">{row.role}</p>
                  ) : null}
                </div>
              </div>
              {row.period ? (
                <p className="mt-4 font-mono text-[12px] tabular-nums text-accent">{row.period}</p>
              ) : null}
              <ul
                className={`${row.period ? "mt-2" : "mt-4"} space-y-1 text-[13px] leading-5 text-foreground/75`}
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

/** 대표 이미지 모서리에 걸치는 작은 원형 수상 도장. 바탕색 위에 테두리 글자가 천천히 돈다. */
function AwardSeal({ year }: { year: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute -right-2.5 -top-2.5 size-20 rounded-full bg-background text-accent shadow-[0_0_0_1px_rgb(155_77_47/0.22),0_8px_20px_-8px_rgb(29_28_25/0.35)] sm:-right-4 sm:-top-4 sm:size-[5.5rem]"
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
      <span className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-current/25">
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
        <span>{project.period}</span>
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
              <span>{project.period.slice(0, 4)}</span>
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

      <Section id="process" eyebrow="How I Work / 02" title="문제에서 시작해, 결과까지 연결합니다.">
        <ol className="grid gap-8 md:grid-cols-3 md:gap-0">
          {PROCESS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-5 md:border-l md:border-ink/15 md:px-8 md:first:border-l-0 md:first:pl-0"
            >
              <FadeContent delay={i * 0.08} className="flex gap-5">
                <span className="font-mono text-2xl leading-8 text-accent">{pad(i + 1)}</span>
                <div>
                  <h3 className="text-lg font-bold leading-8 tracking-[-0.02em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-6 text-foreground/70">{step.body}</p>
                </div>
              </FadeContent>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="devlog"
        eyebrow="Notes / 03"
        title="만들며 남긴 기록"
        action={
          posts.length > NOTE_PREVIEW ? (
            <Link
              href="/devlog/"
              className="inline-flex shrink-0 items-center gap-1 border-b border-accent/60 pb-1 text-[14px] font-medium text-accent hover:border-accent"
            >
              모든 글 보기
              <ArrowUpRight aria-hidden="true" size={14} />
            </Link>
          ) : null
        }
      >
        {posts.length === 0 ? (
          <p className="text-sm text-foreground/70">아직 작성한 글이 없습니다.</p>
        ) : (
          <FadeContent>
            <ol className={styles.notesList}>
              {posts.slice(0, NOTE_PREVIEW).map((post) => (
                <li
                  key={post.slug}
                  className="min-w-0"
                >
                  <NoteLink post={post} />
                </li>
              ))}
            </ol>
          </FadeContent>
        )}
      </Section>
    </div>
  );
}
