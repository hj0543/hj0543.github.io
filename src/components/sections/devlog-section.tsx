"use client";

import { CalendarDays } from "lucide-react";
import { motion, type Variants } from "motion/react";

import WindowFrame from "@/components/ui/window-frame";
import { PROSE } from "@/lib/prose";

export type DevlogPost = {
  /** 확장자를 뗀 파일 이름. 창 제목에 그대로 쓴다. */
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  /** 빌드할 때 마크다운을 변환해 둔 본문. */
  html: string;
};

/** WindowFrame이 창 관리용으로 받는 값들. */
type FrameProps = {
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.14 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 font-mono text-[10px] text-fuchsia-50/75">
      {label}
    </span>
  );
}

export function DevlogSection({
  posts,
  onOpen,
  ...frame
}: FrameProps & {
  posts: DevlogPost[];
  onOpen: (slug: string) => void;
}) {
  return (
    <WindowFrame title="devlog" defaultWidth={620} defaultHeight={540} {...frame}>
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
          Devlog
        </motion.p>

        <div className="mt-6 space-y-2">
          {posts.map((post) => (
            <motion.button
              key={post.slug}
              variants={item}
              type="button"
              onClick={() => onOpen(post.slug)}
              className="group w-full cursor-pointer rounded-xl border border-white/10 bg-white/4 p-4 text-left transition-colors hover:border-accent/45 hover:bg-white/8 focus-visible:border-accent/45 focus-visible:outline-none"
            >
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-foreground/45">
                <CalendarDays aria-hidden="true" size={12} strokeWidth={1.7} />
                {post.date}
              </span>

              <h3 className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                {post.title}
              </h3>

              {post.summary ? (
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground/55">
                  {post.summary}
                </p>
              ) : null}

              {post.tags.length > 0 ? (
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </span>
              ) : null}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </WindowFrame>
  );
}

/** 문서 창의 탭 하나에 들어가는 본문. 창 껍데기는 바깥에서 씌운다. */
export function DevlogDoc({ post }: { post: DevlogPost }) {
  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="p-7 sm:p-9"
    >
      <motion.span
        variants={item}
        className="flex items-center gap-1.5 font-mono text-[11px] text-foreground/45"
      >
        <CalendarDays aria-hidden="true" size={12} strokeWidth={1.7} />
        {post.date}
      </motion.span>

      <motion.h2
        variants={item}
        className="mt-3 text-xl font-bold leading-snug tracking-tight text-foreground"
      >
        {post.title}
      </motion.h2>

      {post.tags.length > 0 ? (
        <motion.div variants={item} className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </motion.div>
      ) : null}

      {/* 본문은 저장소에 직접 쓴 마크다운이라 그대로 삽입한다. */}
      <motion.div
        variants={item}
        className={`mt-6 border-t border-white/10 pt-2 ${PROSE}`}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </motion.article>
  );
}
