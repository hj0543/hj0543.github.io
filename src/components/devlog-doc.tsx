import { ArrowRight, CalendarDays } from "lucide-react";
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

/** 글 목록의 한 줄. 날짜 · 제목 → / 요약 순서로 홈과 /devlog 목록이 함께 쓴다. */
export function NoteLink({ post }: { post: DevlogPost }) {
  return (
    <Link
      href={`/devlog/${post.slug}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-5 gap-y-2 py-6"
    >
      <span className="font-mono text-[12px] tabular-nums text-foreground/65">
        {post.date.replaceAll("-", ".")}
      </span>
      <h3 className="truncate text-[17px] font-bold tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent">
        {post.title}
      </h3>
      <ArrowRight
        aria-hidden="true"
        size={17}
        className="self-center text-foreground/70 transition-transform group-hover:translate-x-1 group-hover:text-accent"
      />
      {post.summary ? (
        <p className="col-start-2 line-clamp-1 text-[14px] text-foreground/70">{post.summary}</p>
      ) : null}
    </Link>
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
