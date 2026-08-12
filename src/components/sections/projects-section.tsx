"use client";

import {
  CalendarDays,
  Code,
  ExternalLink,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";

import WindowFrame from "@/components/ui/window-frame";
import { PROSE } from "@/lib/prose";

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

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-ink/12 bg-ink/6 px-2.5 py-1 font-mono text-[10px] text-foreground/75">
      {label}
    </span>
  );
}

/** 문서 상단의 GitHub·배포 링크 버튼 줄. */
function LinkButtons({ links }: { links: Project["links"] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, href }) => {
        const Icon = /github/i.test(label) ? Code : ExternalLink;
        return (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-ink/12 bg-ink/6 px-3 py-1.5 font-mono text-[11px] text-foreground/75 transition-colors hover:border-accent/45 hover:text-accent focus-visible:border-accent/45 focus-visible:outline-none"
          >
            <Icon aria-hidden="true" size={12} strokeWidth={1.8} />
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <motion.button
              key={project.slug}
              variants={item}
              type="button"
              onClick={() => onOpen(project.slug)}
              className={`group cursor-pointer rounded-xl border border-ink/10 bg-ink/4 p-3.5 text-left transition-colors hover:border-accent/45 hover:bg-ink/8 focus-visible:border-accent/45 focus-visible:outline-none ${
                project.featured ? "sm:col-span-2" : ""
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
                  <Badge key={tech} label={tech} />
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
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-7 sm:p-8"
    >
      <motion.div variants={item}>
        <Thumb project={project} />
      </motion.div>

      <motion.h2
        variants={item}
        className="mt-5 text-xl font-bold tracking-tight text-foreground"
      >
        {project.name}
      </motion.h2>
      <motion.p variants={item} className="mt-1.5 text-sm text-foreground/55">
        {project.tagline}
      </motion.p>

      {project.links.length > 0 ? (
        <motion.div variants={item} className="mt-4">
          <LinkButtons links={project.links} />
        </motion.div>
      ) : null}

      <motion.div variants={item} className="mt-5 border-y border-ink/10 py-4">
        <Meta project={project} />
      </motion.div>

      {/* 본문은 저장소에 직접 쓴 마크다운이라 그대로 삽입한다. */}
      <motion.div
        variants={item}
        className={`mt-2 ${PROSE}`}
        dangerouslySetInnerHTML={{ __html: project.html }}
      />

      <motion.div variants={item} className="mt-7 flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <Badge key={tech} label={tech} />
        ))}
      </motion.div>
    </motion.div>
  );
}
