"use client";

import { CalendarDays, UserCog, Users } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";

import WindowFrame from "@/components/ui/window-frame";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  /** /public 기준 경로. 없으면 자리표시 타일을 대신 그린다. */
  thumbnail?: string;
  role: string;
  period: string;
  team: string;
  stack: string[];
  /** 상세 창에 줄 단위로 표시할 설명. */
  detail: string[];
};

export const projects: Project[] = [
  {
    id: "1",
    name: "Discord Algorithms Study Bot",
    tagline: "알고리즘 스터디 운영 자동화 봇",
    role: "1인 기획 · 개발",
    period: "2026.02 ~ 2026.03",
    team: "개인",
    stack: ["Python", "discord.py", "Oracle Cloud"],
    detail: [
      "반복적인 문제 선정과 풀이 여부 확인을 자동화하기 위해 디스코드 봇을 개발했습니다.",
      "난이도·유형별 문제 추천과 스터디원의 풀이 현황을 확인하는 명령어를 구현했습니다.",
      "문제 선정에 걸리는 시간을 평균 2분에서 30초로 단축하고 안정적인 상시 운영 환경을 구축했습니다.",
    ],
  },
  {
    id: "2",
    name: "Homefit",
    tagline: "개인 맞춤형 부동산 추천 서비스",
    role: "Full-stack(FE + BE)",
    period: "2026.05 ~ 2026.06",
    team: "2인",
    stack: ["Vue.js", "JavaScript", "Django", "FastAPI"],
    detail: [
      "금융 상황과 주거 선호를 함께 고려해 감당 가능한 주거지를 추천하는 서비스를 개발했습니다.",
      "매물 검색·상세·찜 UI와 실거래가 기반 추천 및 대출 시뮬레이션 기능을 구현했습니다.",
      "분산된 부동산 데이터를 사용자 관점의 추천 근거와 점수로 가공하는 과정을 경험했습니다.",
    ],
  },
  {
    id: "3",
    name: "Ait",
    tagline: "SSAFY 공통 프로젝트 - 웹 기술",
    role: "Frontend Leader",
    period: "2026.07 ~ 2026.08",
    team: "6인 팀",
    stack: ["React", "TypeScript", "Tailwind CSS", "LiveKit"],
    detail: [
      "개발자가 혼자 또는 스터디원과 면접을 연습하고 피드백받을 수 있는 플랫폼을 개발했습니다.",
      "프론트엔드 리더로서 공통 아키텍처와 UI 시스템을 설계하고 AI 면접·화상 스터디 화면을 구현했습니다.",
      "LiveKit 기반 실시간 화상 기능과 AI 분석 결과를 일관된 사용자 경험으로 연결했습니다.",
    ],
  },
  {
    id: "4",
    name: "프로젝트 명 미정",
    tagline: "SSAFY 특화 프로젝트 - 핀테크",
    role: "Backend, Team leader",
    period: "2026.08 ~ ing",
    team: "6인 팀",
    stack: ["Springboot"],
    detail: [
      "",
    ],
  },
];

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
    <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 font-mono text-[10px] text-fuchsia-50/75">
      {label}
    </span>
  );
}

/** 썸네일 자리. 이미지가 없으면 이름 머리글자로 채운다. */
function Thumb({ project }: { project: Project }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-linear-to-br from-accent-deep/25 to-accent/10">
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
  onOpen,
  ...frame
}: {
  onOpen: (id: string) => void;
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
}) {
  return (
    <WindowFrame title="projects" defaultWidth={720} defaultHeight={560} {...frame}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-7 sm:p-8"
      >
        <motion.p
          variants={item}
          className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-accent/80"
        >
          <span className="h-px w-6 bg-accent/50" />
          Projects
        </motion.p>

        <motion.p variants={item} className="mt-4 text-sm text-foreground/55">
          카드를 누르면 새 창에서 자세히 볼 수 있습니다.
        </motion.p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <motion.button
              key={project.id}
              variants={item}
              type="button"
              onClick={() => onOpen(project.id)}
              className="group cursor-pointer rounded-xl border border-white/10 bg-white/4 p-3.5 text-left transition-colors hover:border-accent/45 hover:bg-white/8 focus-visible:border-accent/45 focus-visible:outline-none"
            >
              <Thumb project={project} />

              <h3 className="mt-3.5 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                {project.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/55">
                {project.tagline}
              </p>

              <div className="mt-3 border-t border-white/8 pt-3">
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

export function ProjectWindow({
  project,
  ...frame
}: {
  project: Project;
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
}) {
  return (
    <WindowFrame
      title={`${project.id}.md`}
      defaultWidth={520}
      defaultHeight={520}
      {...frame}
    >
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

        <motion.div
          variants={item}
          className="mt-5 border-y border-white/10 py-4"
        >
          <Meta project={project} />
        </motion.div>

        <motion.ul variants={item} className="mt-5 space-y-2.5">
          {project.detail.map((line) => (
            <li
              key={line}
              className="flex gap-2.5 text-sm leading-relaxed text-foreground/65"
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent/60" />
              {line}
            </li>
          ))}
        </motion.ul>

        <motion.div variants={item} className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <Badge key={tech} label={tech} />
          ))}
        </motion.div>
      </motion.div>
    </WindowFrame>
  );
}
