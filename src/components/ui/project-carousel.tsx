"use client";

import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, type PanInfo, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ProjectScreen = {
  src: string;
  alt: string;
  caption?: string;
};

// 드래그 거리나 속도 중 하나가 임계값을 넘으면 다음 슬라이드로 판정한다.
const SWIPE_DISTANCE = 56;
const SWIPE_VELOCITY = 500;

/** 버튼·키보드·드래그 조작을 지원하는 프로젝트 화면 캐러셀. */
export default function ProjectCarousel({
  screens,
}: {
  screens: ProjectScreen[];
}) {
  const canNavigate = screens.length > 1;
  // 양 끝에 반대편 슬라이드를 복제해 경계에서도 끊기지 않는 순환 이동을 만든다.
  const slides = useMemo(
    () =>
      canNavigate
        ? [screens[screens.length - 1], ...screens, screens[0]]
        : screens,
    [canNavigate, screens],
  );
  const [position, setPosition] = useState(canNavigate ? 1 : 0);
  // 슬라이드 이동 거리는 현재 뷰포트의 실제 폭을 기준으로 계산한다.
  const [width, setWidth] = useState(0);
  const [animate, setAnimate] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const activeIndex = canNavigate
    ? (position - 1 + screens.length) % screens.length
    : 0;
  const activeScreen = screens[activeIndex];

  /** 복제 슬라이드 범위를 벗어나지 않도록 한 칸씩 이동한다. */
  const move = useCallback(
    (direction: -1 | 1) => {
      if (!canNavigate) return;
      setAnimate(true);
      setPosition((current) =>
        Math.max(0, Math.min(current + direction, screens.length + 1)),
      );
    },
    [canNavigate, screens.length],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  /** 복제된 첫·마지막 슬라이드에 도착하면 애니메이션 없이 실제 위치로 되감는다. */
  const handleAnimationComplete = () => {
    if (!canNavigate) return;

    let nextPosition: number | null = null;
    if (position === 0) nextPosition = screens.length;
    if (position === screens.length + 1) nextPosition = 1;
    if (nextPosition === null) return;

    setAnimate(false);
    setPosition(nextPosition);
    window.requestAnimationFrame(() => setAnimate(true));
  };

  /** 느리게 멀리 끌거나 짧게 빠르게 튕기는 동작을 모두 스와이프로 인정한다. */
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (
      info.offset.x <= -SWIPE_DISTANCE ||
      info.velocity.x <= -SWIPE_VELOCITY
    ) {
      move(1);
    } else if (
      info.offset.x >= SWIPE_DISTANCE ||
      info.velocity.x >= SWIPE_VELOCITY
    ) {
      move(-1);
    }
  };

  if (!activeScreen) return null;

  // 모든 슬라이드가 같은 폭이므로 인덱스와 측정 폭의 곱만큼 트랙을 이동한다.
  const targetX = -position * width;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="프로젝트 대표 화면"
      className="overflow-hidden border border-ink/12 bg-ink/3"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
    >
      <div ref={viewportRef} className="relative overflow-hidden bg-black/20">
        <motion.div
          className="flex touch-pan-y"
          initial={false}
          animate={{ x: targetX }}
          transition={
            animate && !reduceMotion
              ? { type: "spring", stiffness: 280, damping: 32 }
              : { duration: 0 }
          }
          drag={canNavigate ? "x" : false}
          dragConstraints={{
            left: targetX - width * 0.18,
            right: targetX + width * 0.18,
          }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          onAnimationComplete={handleAnimationComplete}
        >
          {slides.map((screen, index) => (
            <div
              key={`${screen.src}-${index}`}
              aria-hidden={index !== position}
              className="relative aspect-video min-w-full select-none"
            >
              <Image
                src={screen.src}
                alt={index === position ? screen.alt : ""}
                fill
                draggable={false}
                sizes="(max-width: 640px) calc(100vw - 3.5rem), 600px"
                className="pointer-events-none object-contain"
              />
            </div>
          ))}
        </motion.div>

        {canNavigate ? (
          <>
            <button
              type="button"
              aria-label="이전 화면"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center border border-white/15 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              aria-label="다음 화면"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center border border-white/15 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex min-h-12 items-center gap-3 border-t border-ink/10 px-3.5 py-2">
        <span
          aria-live="polite"
          className="shrink-0 font-mono text-[10px] tabular-nums text-foreground/45"
        >
          {String(activeIndex + 1).padStart(2, "0")} / {String(screens.length).padStart(2, "0")}
        </span>

        <p className="min-w-0 flex-1 truncate text-xs text-foreground/65">
          {activeScreen.caption ?? activeScreen.alt}
        </p>

        <a
          href={activeScreen.src}
          target="_blank"
          rel="noreferrer"
          aria-label={`${activeScreen.alt} 원본 보기`}
          className="grid size-8 shrink-0 place-items-center text-foreground/45 transition-colors hover:bg-ink/8 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <Maximize2 aria-hidden="true" size={14} />
        </a>
      </div>

      {canNavigate ? (
        <div
          className="flex gap-2 overflow-x-auto border-t border-ink/8 px-3 py-2.5 [&::-webkit-scrollbar]:hidden"
          aria-label="화면 선택"
        >
          {screens.map((screen, index) => (
            <button
              key={screen.src}
              type="button"
              aria-label={`${index + 1}번 화면: ${screen.alt}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => {
                setAnimate(true);
                setPosition(index + 1);
              }}
              className={`group relative aspect-video w-16 shrink-0 cursor-pointer overflow-hidden border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                activeIndex === index
                  ? "border-accent ring-1 ring-accent/35"
                  : "border-ink/10 opacity-55 hover:border-ink/25 hover:opacity-90"
              }`}
            >
              <Image
                src={screen.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
