import { CalendarDays } from "lucide-react";
import Link from "next/link";

import styles from "./doc-prose.module.css";

export type DevlogPost = {
  /** 확장자를 뗀 파일 이름. 상세 페이지 주소에 그대로 쓴다. */
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  /** 빌드할 때 마크다운을 변환해 둔 본문. */
  html: string;
};

export function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-ink/12 bg-ink/6 px-2.5 py-1 font-mono text-[10px] text-foreground/75">
      {label}
    </span>
  );
}

/** 글 상세 페이지 본문. 페이지 껍데기는 바깥에서 씌운다. */
export function DevlogDoc({ post }: { post: DevlogPost }) {
  return (
    <article className="mx-auto max-w-[760px] px-5 pb-24 pt-8 sm:px-8 sm:pt-10">
      <div>
        <Link
          href="/#devlog"
          className="font-mono text-[12px] text-foreground/50 transition-colors hover:text-accent"
        >
          ← Devlog
        </Link>
      </div>

      <span className="mt-10 flex items-center gap-1.5 font-mono text-[12px] text-foreground/45">
        <CalendarDays aria-hidden="true" size={13} strokeWidth={1.7} />
        {post.date}
      </span>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-[2.25rem]">
        {post.title}
      </h1>

      {post.summary ? (
        <p className="mt-4 text-[16px] leading-7 text-foreground/60">
          {post.summary}
        </p>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      ) : null}

      {/* 본문은 저장소에 직접 쓴 마크다운이라 그대로 삽입한다. */}
      <div
        className={`mt-10 border-t border-ink/10 ${styles.prose}`}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
