"use client";

import { CodeXml, X } from "lucide-react";
import { motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Rect = { x: number; y: number; w: number; h: number };

/** 리사이즈 방향. n/s/e/w 문자 포함 여부로 어느 변을 움직일지 판단한다. */
type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type WindowFrameProps = {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  /** 처음 열릴 때의 크기. 화면이 좁으면 뷰포트에 맞게 줄어든다. */
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  className?: string;
};

const TITLE_BAR = 44; // 제목 표시줄 높이(px)
const MARGIN = 16; // 뷰포트 가장자리에서 남겨둘 여백
const DOCK_SAFE = 148; // 하단 Dock에 가리지 않도록 비워둘 높이
const GRAB = 72; // 창을 화면 밖으로 끌어낼 때 최소한 남겨둘 너비

const HANDLES: { dir: ResizeDir; className: string }[] = [
  { dir: "n", className: "-top-1 left-3 right-3 h-2 cursor-ns-resize" },
  { dir: "s", className: "-bottom-1 left-3 right-3 h-2 cursor-ns-resize" },
  { dir: "w", className: "-left-1 top-3 bottom-3 w-2 cursor-ew-resize" },
  { dir: "e", className: "-right-1 top-3 bottom-3 w-2 cursor-ew-resize" },
  { dir: "nw", className: "-top-1 -left-1 size-3 cursor-nwse-resize" },
  { dir: "ne", className: "-top-1 -right-1 size-3 cursor-nesw-resize" },
  { dir: "sw", className: "-bottom-1 -left-1 size-3 cursor-nesw-resize" },
  { dir: "se", className: "-bottom-1 -right-1 size-3 cursor-nwse-resize" },
];

function viewport() {
  return { vw: window.innerWidth, vh: window.innerHeight };
}

/** 제목 표시줄이 항상 잡을 수 있는 위치에 남도록 좌표를 제한한다. */
function clampPosition(rect: Rect): Rect {
  const { vw, vh } = viewport();
  return {
    ...rect,
    x: Math.min(Math.max(rect.x, GRAB - rect.w), vw - GRAB),
    y: Math.min(Math.max(rect.y, 0), vh - TITLE_BAR),
  };
}

export default function WindowFrame({
  title,
  children,
  onClose,
  defaultWidth = 560,
  defaultHeight = 460,
  minWidth = 320,
  minHeight = 200,
  className,
}: WindowFrameProps) {
  // 첫 렌더에서 뷰포트 크기에 맞춘 초기 위치를 계산한다(클릭으로 열리므로 SSR 대상이 아니다).
  const [rect, setRect] = useState<Rect>(() => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0, w: defaultWidth, h: defaultHeight };
    }
    const { vw, vh } = viewport();
    const w = Math.min(defaultWidth, vw - MARGIN * 2);
    const h = Math.min(defaultHeight, vh - MARGIN - DOCK_SAFE);
    return { x: (vw - w) / 2, y: Math.max((vh - DOCK_SAFE - h) / 2, MARGIN), w, h };
  });

  const [maximized, setMaximized] = useState(false);
  const restoreRect = useRef<Rect | null>(null);

  // 드래그·리사이즈가 시작될 때의 기준값. 렌더를 유발하지 않도록 ref에 담는다.
  const gesture = useRef<{
    pointerId: number;
    dir: ResizeDir | null;
    start: Rect;
    startX: number;
    startY: number;
  } | null>(null);

  const toggleMaximize = useCallback(() => {
    if (maximized) {
      if (restoreRect.current) setRect(clampPosition(restoreRect.current));
      setMaximized(false);
    } else {
      const { vw, vh } = viewport();
      restoreRect.current = rect;
      setRect({
        x: MARGIN,
        y: MARGIN,
        w: vw - MARGIN * 2,
        h: vh - MARGIN - DOCK_SAFE,
      });
      setMaximized(true);
    }
  }, [maximized, rect]);

  // Escape로 닫고, 브라우저 창이 줄어들면 창을 화면 안으로 되돌린다.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    const onResize = () => setRect((current) => clampPosition(current));

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  const beginGesture = (
    event: React.PointerEvent<HTMLElement>,
    dir: ResizeDir | null,
  ) => {
    if (event.button !== 0 || maximized) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      dir,
      start: rect,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const updateGesture = (event: React.PointerEvent<HTMLElement>) => {
    const state = gesture.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    if (!state.dir) {
      setRect(clampPosition({ ...state.start, x: state.start.x + dx, y: state.start.y + dy }));
      return;
    }

    const { vw, vh } = viewport();
    const { dir, start } = state;
    let { x, y, w, h } = start;

    if (dir.includes("e")) w = start.w + dx;
    if (dir.includes("s")) h = start.h + dy;
    // 왼쪽·위쪽 변은 크기와 좌표가 함께 움직인다.
    if (dir.includes("w")) {
      w = start.w - dx;
      x = start.x + dx;
    }
    if (dir.includes("n")) {
      h = start.h - dy;
      y = start.y + dy;
    }

    // 최소 크기에 걸리면 반대편 변이 제자리에 남도록 좌표를 고정한다.
    if (w < minWidth) {
      if (dir.includes("w")) x = start.x + start.w - minWidth;
      w = minWidth;
    }
    if (h < minHeight) {
      if (dir.includes("n")) y = start.y + start.h - minHeight;
      h = minHeight;
    }

    // 뷰포트를 넘어가지 않도록 자른다.
    if (x < 0) {
      w += x;
      x = 0;
    }
    if (y < 0) {
      h += y;
      y = 0;
    }
    if (x + w > vw) w = vw - x;
    if (y + h > vh) h = vh - y;

    setRect({ x, y, w: Math.max(w, minWidth), h: Math.max(h, minHeight) });
  };

  const endGesture = (event: React.PointerEvent<HTMLElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      role="dialog"
      aria-label={title}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
      }}
      className="pointer-events-auto absolute"
    >
      {/*
        실제 창 표면. 리사이즈 손잡이는 테두리 바깥까지 걸쳐 있어야 해서
        overflow-hidden은 이 안쪽 요소에만 건다.
      */}
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0d0718]/80 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl",
          className,
        )}
      >
        {/* 제목 표시줄: 여기서만 창을 끌어 옮길 수 있다. */}
        <div
          onPointerDown={(event) => beginGesture(event, null)}
          onPointerMove={updateGesture}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          onDoubleClick={toggleMaximize}
          className={cn(
            "flex shrink-0 touch-none select-none items-center gap-3 border-b border-white/10 bg-white/4 pl-3 pr-2",
            maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          )}
          style={{ height: TITLE_BAR }}
        >
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/6 text-foreground/70"
          >
            <CodeXml size={14} strokeWidth={2} />
          </span>

          <span className="h-4 w-px shrink-0 bg-white/10" />

          {/* 열려 있는 창 이름 하나만 표시한다. */}
          <span className="truncate font-mono text-[13px] text-foreground/85">
            {title}
          </span>

          <button
            type="button"
            aria-label="닫기"
            title="닫기"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground/45 transition-colors hover:bg-[#ff5f57]/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X aria-hidden size={15} strokeWidth={2} />
          </button>
        </div>

        {/* 본문은 창 크기를 넘으면 스크롤된다. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>

      {/* 테두리에 겹쳐 놓은 리사이즈 손잡이. 최대화 상태에서는 숨긴다. */}
      {maximized
        ? null
        : HANDLES.map(({ dir, className: handleClass }) => (
            <div
              key={dir}
              onPointerDown={(event) => beginGesture(event, dir)}
              onPointerMove={updateGesture}
              onPointerUp={endGesture}
              onPointerCancel={endGesture}
              className={cn("absolute z-10 touch-none", handleClass)}
            />
          ))}
    </motion.div>
  );
}
