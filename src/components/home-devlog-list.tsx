"use client";

import { useState, type ReactNode } from "react";

import styles from "@/app/home.module.css";

const BATCH_SIZE = 6;

export default function HomeDevlogList({ items }: { items: ReactNode[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const shownCount = Math.min(visibleCount, items.length);
  const nextCount = Math.min(BATCH_SIZE, items.length - shownCount);

  return (
    <>
      <ol id="home-devlog-list" className={styles.notesList}>
        {items.slice(0, visibleCount)}
      </ol>
      <p role="status" className="sr-only">
        전체 {items.length}개 중 {shownCount}개의 글을 표시하고 있습니다.
      </p>
      {nextCount > 0 ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            aria-controls="home-devlog-list"
            onClick={() => setVisibleCount((count) => Math.min(count + BATCH_SIZE, items.length))}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-ink/25 px-6 text-[14px] font-medium text-foreground/80 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            이전 기록 {nextCount}개 더 보기
          </button>
        </div>
      ) : null}
    </>
  );
}
