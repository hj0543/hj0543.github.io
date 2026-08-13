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

const SWIPE_DISTANCE = 56;
const SWIPE_VELOCITY = 500;

export default function ProjectCarousel({
  screens,
}: {
  screens: ProjectScreen[];
}) {
  const canNavigate = screens.length > 1;
  const slides = useMemo(
    () =>
      canNavigate
        ? [screens[screens.length - 1], ...screens, screens[0]]
        : screens,
    [canNavigate, screens],
  );
  const [position, setPosition] = useState(canNavigate ? 1 : 0);
  const [width, setWidth] = useState(0);
  const [animate, setAnimate] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const activeIndex = canNavigate
    ? (position - 1 + screens.length) % screens.length
    : 0;
  const activeScreen = screens[activeIndex];

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

  const targetX = -position * width;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="프로젝트 대표 화면"
      className="overflow-hidden rounded-xl border border-ink/10 bg-ink/4"
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
              className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              aria-label="다음 화면"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
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
          className="grid size-8 shrink-0 place-items-center rounded-full text-foreground/45 transition-colors hover:bg-ink/8 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
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
              className={`group relative aspect-video w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
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
              <span
                aria-hidden="true"
                className="absolute bottom-0.5 right-1 rounded bg-black/60 px-1 font-mono text-[8px] tabular-nums text-white/85"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
