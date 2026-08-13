"use client";

import {
  ChevronDown,
  CodeXml,
  Maximize2,
  Minimize2,
  Minus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { useWindowChrome } from "@/lib/window-chrome";

type Rect = { x: number; y: number; w: number; h: number };

/** 리사이즈 방향. n/s/e/w 문자 포함 여부로 어느 변을 움직일지 판단한다. */
type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** 제목줄에 나열할 문서 탭. */
export type WindowTab<T extends string = string> = { id: T; label: string };

export type WindowFrameProps<T extends string = string> = {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  /** 넘기면 제목 자리에 탭 목록을 그린다. 창 하나가 문서 여러 개를 품을 때 쓴다. */
  tabs?: WindowTab<T>[];
  activeTab?: T;
  onSelectTab?: (id: T) => void;
  onCloseTab?: (id: T) => void;
  /** 값이 바뀌면 접어둔 창을 다시 펼친다. 이미 보고 있는 탭을 또 눌렀을 때가 이 경우다. */
  reveal?: number;
  /** 처음 열릴 때의 크기. 화면이 좁으면 뷰포트에 맞게 줄어든다. */
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  /** 창이 여러 개 열렸을 때의 쌓임 순서. */
  z?: number;
  /** 창 아무 곳이나 누르면 맨 앞으로 올린다. */
  onFocus?: () => void;
  /** 나중에 열린 창을 계단식으로 어긋나게 놓는 거리(px). */
  offset?: number;
  className?: string;
};

const TITLE_BAR = 44; // 제목 표시줄 높이(px)
const MARGIN = 16; // 뷰포트 가장자리에서 남겨둘 여백
const DOCK_SAFE = 148; // 하단 Dock에 가리지 않도록 비워둘 높이
const GRAB = 72; // 창을 화면 밖으로 끌어낼 때 최소한 남겨둘 너비
const SNAP_EDGE = 10; // 커서가 이 거리 안으로 들어오면 스냅 후보로 본다(px)

/** 드래그 중 커서가 화면 가장자리에 닿았을 때의 스냅 방향. */
type SnapTarget = "left" | "right" | "top" | null;

/** 스냅 방향이 차지할 영역. 최대화와 같은 작업 영역(여백·Dock 제외)을 나눈다. */
function snapRect(target: Exclude<SnapTarget, null>): Rect {
  const { vw, vh } = viewport();
  const workW = vw - MARGIN * 2;
  const h = vh - MARGIN - DOCK_SAFE;
  if (target === "top") return { x: MARGIN, y: MARGIN, w: workW, h };
  const half = Math.max(workW / 2 - 4, 280);
  return {
    x: target === "left" ? MARGIN : MARGIN + workW - half,
    y: MARGIN,
    w: half,
    h,
  };
}

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

// 제목줄 버튼 공통 모양. hover 색만 각자 다르게 얹는다. (windows 스타일)
const TITLE_BUTTON =
  "flex size-7 cursor-pointer items-center justify-center rounded-md text-foreground/45 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/60";

// mac 스타일 신호등 버튼. 글리프는 버튼 묶음에 마우스를 올렸을 때만 보인다.
const MAC_BUTTON =
  "flex size-3.5 cursor-pointer items-center justify-center rounded-full text-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/60";
const MAC_GLYPH =
  "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100";

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

export default function WindowFrame<T extends string = string>({
  title,
  children,
  onClose,
  tabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  reveal,
  defaultWidth = 840,
  defaultHeight = 690,
  minWidth = 320,
  minHeight = 200,
  z,
  onFocus,
  offset = 0,
  className,
}: WindowFrameProps<T>) {
  // 제목줄 스타일(mac 신호등 / windows 아이콘). 토글하면 열려 있는 창이 모두 바뀐다.
  const chrome = useWindowChrome();
  // 첫 렌더에서 뷰포트 크기에 맞춘 초기 위치를 계산한다(클릭으로 열리므로 SSR 대상이 아니다).
  const [rect, setRect] = useState<Rect>(() => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0, w: defaultWidth, h: defaultHeight };
    }
    const { vw, vh } = viewport();
    const w = Math.min(defaultWidth, vw - MARGIN * 2);
    const h = Math.min(defaultHeight, vh - MARGIN - DOCK_SAFE);
    // 모바일에서는 계단식 오프셋이 창을 화면 밖으로 밀어내므로 새 창을 같은 자리에 연다.
    const placementOffset = vw < 640 ? 0 : offset;
    return clampPosition({
      x: (vw - w) / 2 + placementOffset,
      y: Math.max((vh - DOCK_SAFE - h) / 2, MARGIN) + placementOffset,
      w,
      h,
    });
  });

  const [maximized, setMaximized] = useState(false);
  // 최소화는 제목줄만 남기고 접는 것이다. 크기와 위치는 그대로 둔다.
  const [minimized, setMinimized] = useState(false);
  // 드래그 중 화면 가장자리에 닿으면 놓았을 때 붙을 영역을 미리 보여준다.
  const [snapTarget, setSnapTarget] = useState<SnapTarget>(null);
  const restoreRect = useRef<Rect | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // 새 문서를 띄우면 접어둔 창을 펼친다. 효과로 미루면 접힌 화면이 한 프레임 비치므로
  // 렌더 중에 맞춰 둔다. 탭이 없는 창은 두 값이 늘 undefined라 이 분기에 걸리지 않는다.
  const [shown, setShown] = useState({ activeTab, reveal });
  if (shown.activeTab !== activeTab || shown.reveal !== reveal) {
    setShown({ activeTab, reveal });
    setMinimized(false);
  }

  // 드래그·리사이즈가 시작될 때의 기준값. 렌더를 유발하지 않도록 ref에 담는다.
  const gesture = useRef<{
    pointerId: number;
    dir: ResizeDir | null;
    start: Rect;
    startX: number;
    startY: number;
  } | null>(null);

  const toggleMinimize = useCallback(() => {
    setMinimized((value) => !value);
  }, []);

  const toggleMaximize = useCallback(() => {
    setMinimized(false);
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

  // 브라우저 창이 줄어들면 창을 화면 안으로 되돌린다.
  // Escape 처리는 맨 앞 창 하나만 닫아야 해서 창 목록을 아는 쪽이 맡는다.
  useEffect(() => {
    const onResize = () => {
      const { vw, vh } = viewport();
      // 최대화 상태면 새 뷰포트를 다시 채우고, 아니면 화면 안으로 되돌린다.
      setRect((current) =>
        maximized
          ? {
              x: MARGIN,
              y: MARGIN,
              w: vw - MARGIN * 2,
              h: vh - MARGIN - DOCK_SAFE,
            }
          : clampPosition(current),
      );
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maximized]);

  // 이전 문서에서 내려둔 스크롤이 새 문서에 남지 않게 위로 되돌린다.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab, reveal]);

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
      // 커서가 위·왼쪽·오른쪽 가장자리에 닿으면 스냅 후보를 잡는다.
      const { vw } = viewport();
      setSnapTarget(
        event.clientY <= SNAP_EDGE
          ? "top"
          : event.clientX <= SNAP_EDGE
            ? "left"
            : event.clientX >= vw - SNAP_EDGE
              ? "right"
              : null,
      );
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
    const state = gesture.current;
    if (state?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // 드래그를 가장자리에서 놓으면 스냅한다. 위쪽은 최대화와 같아서 복원 크기도 함께 기억한다.
    // 포인터가 취소된 경우(pointercancel)는 스냅하지 않고 후보만 지운다.
    if (event.type === "pointercancel") {
      setSnapTarget(null);
      return;
    }
    if (state.dir === null && snapTarget) {
      if (snapTarget === "top") {
        restoreRect.current = state.start;
        setMaximized(true);
      }
      setRect(snapRect(snapTarget));
      setSnapTarget(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      role="dialog"
      aria-label={title}
      onPointerDownCapture={onFocus}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: minimized ? TITLE_BAR : rect.h,
        zIndex: z,
      }}
      className="pointer-events-auto absolute"
    >
      {/*
        실제 창 표면. 리사이즈 손잡이는 테두리 바깥까지 걸쳐 있어야 해서
        overflow-hidden은 이 안쪽 요소에만 건다.
      */}
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-ink/15 bg-surface/80 shadow-[var(--window-shadow)] backdrop-blur-xl",
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
            "flex shrink-0 touch-none select-none items-center gap-3 border-b border-ink/10 bg-ink/4 pl-3 pr-2",
            maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          )}
          style={{ height: TITLE_BAR }}
        >
          {/* mac 스타일: 왼쪽 신호등 버튼(닫기·최소화·최대화). */}
          {chrome === "mac" ? (
            <div
              onDoubleClick={(event) => event.stopPropagation()}
              className="group flex shrink-0 items-center gap-2"
            >
              <button
                type="button"
                aria-label="닫기"
                title="닫기"
                onClick={onClose}
                onPointerDown={(event) => event.stopPropagation()}
                className={cn(MAC_BUTTON, "bg-[#ff5f57]")}
              >
                <X aria-hidden size={9} strokeWidth={2.5} className={MAC_GLYPH} />
              </button>

              <button
                type="button"
                aria-label={minimized ? "펼치기" : "최소화"}
                title={minimized ? "펼치기" : "최소화"}
                aria-pressed={minimized}
                onClick={toggleMinimize}
                onPointerDown={(event) => event.stopPropagation()}
                className={cn(MAC_BUTTON, "bg-[#febc2e]")}
              >
                {minimized ? (
                  <ChevronDown aria-hidden size={9} strokeWidth={2.5} className={MAC_GLYPH} />
                ) : (
                  <Minus aria-hidden size={9} strokeWidth={2.5} className={MAC_GLYPH} />
                )}
              </button>

              <button
                type="button"
                aria-label={maximized ? "이전 크기로" : "창 키우기"}
                title={maximized ? "이전 크기로" : "창 키우기"}
                aria-pressed={maximized}
                onClick={toggleMaximize}
                onPointerDown={(event) => event.stopPropagation()}
                className={cn(MAC_BUTTON, "bg-[#28c840]")}
              >
                {maximized ? (
                  <Minimize2 aria-hidden size={8} strokeWidth={2.5} className={MAC_GLYPH} />
                ) : (
                  <Maximize2 aria-hidden size={8} strokeWidth={2.5} className={MAC_GLYPH} />
                )}
              </button>
            </div>
          ) : (
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-ink/12 bg-ink/6 text-foreground/70"
            >
              <CodeXml size={14} strokeWidth={2} />
            </span>
          )}

          <span className="h-4 w-px shrink-0 bg-ink/10" />

          {tabs && tabs.length > 0 ? (
            // 탭이 넘치면 가로로 스크롤한다. 스크롤바는 제목줄을 어지럽혀 숨긴다.
            <div
              onDoubleClick={(event) => event.stopPropagation()}
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <span
                    key={tab.id}
                    className={cn(
                      "group flex h-7 shrink-0 items-center rounded-md border pl-2.5 pr-1 transition-colors",
                      active
                        ? "border-accent/40 bg-ink/10"
                        : "border-transparent hover:bg-ink/6",
                    )}
                  >
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() => onSelectTab?.(tab.id)}
                      onPointerDown={(event) => event.stopPropagation()}
                      className={cn(
                        "cursor-pointer font-mono text-[12px] transition-colors focus-visible:outline-none",
                        active
                          ? "text-foreground"
                          : "text-foreground/50 hover:text-foreground/80",
                      )}
                    >
                      {tab.label}
                    </button>

                    <button
                      type="button"
                      aria-label={`${tab.label} 닫기`}
                      title="탭 닫기"
                      onClick={() => onCloseTab?.(tab.id)}
                      onPointerDown={(event) => event.stopPropagation()}
                      className={cn(
                        "ml-1.5 flex size-4 cursor-pointer items-center justify-center rounded text-foreground/40 transition hover:bg-ink/15 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <X aria-hidden size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            /* 열려 있는 창 이름 하나만 표시한다. */
            <span className="truncate font-mono text-[13px] text-foreground/85">
              {title}
            </span>
          )}

          {/* windows 스타일: 오른쪽 아이콘 버튼.
              버튼을 두 번 눌러도 제목줄의 더블클릭이 겹쳐 동작하지 않게 막는다. */}
          {chrome === "windows" ? (
          <div
            onDoubleClick={(event) => event.stopPropagation()}
            className="ml-auto flex shrink-0 items-center gap-0.5"
          >
            <button
              type="button"
              aria-label={minimized ? "펼치기" : "최소화"}
              title={minimized ? "펼치기" : "최소화"}
              aria-pressed={minimized}
              onClick={toggleMinimize}
              onPointerDown={(event) => event.stopPropagation()}
              className={cn(TITLE_BUTTON, "hover:bg-[#febc2e]/90 hover:text-black/75")}
            >
              {minimized ? (
                <ChevronDown aria-hidden size={14} strokeWidth={2.4} />
              ) : (
                <Minus aria-hidden size={14} strokeWidth={2.4} />
              )}
            </button>

            <button
              type="button"
              aria-label={maximized ? "이전 크기로" : "창 키우기"}
              title={maximized ? "이전 크기로" : "창 키우기"}
              aria-pressed={maximized}
              onClick={toggleMaximize}
              onPointerDown={(event) => event.stopPropagation()}
              className={cn(TITLE_BUTTON, "hover:bg-[#28c840]/85 hover:text-black/75")}
            >
              {maximized ? (
                <Minimize2 aria-hidden size={13} strokeWidth={2} />
              ) : (
                <Maximize2 aria-hidden size={13} strokeWidth={2} />
              )}
            </button>

            <button
              type="button"
              aria-label="닫기"
              title="닫기"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              className={cn(TITLE_BUTTON, "hover:bg-[#ff5f57]/85 hover:text-white")}
            >
              <X aria-hidden size={15} strokeWidth={2} />
            </button>
          </div>
          ) : null}
        </div>

        {/* 본문은 창 크기를 넘으면 스크롤된다. 최소화하면 제목줄만 남긴다. */}
        {minimized ? null : (
          <div
            ref={bodyRef}
            // @container: 본문이 창 크기를 기준으로 반응하도록 컨테이너 쿼리 기준점을 만든다.
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain @container"
          >
            {children}
          </div>
        )}
      </div>

      {/* 스냅 미리보기. 창의 transform 영향을 받지 않도록 body에 그린다. */}
      {snapTarget
        ? createPortal(
            <div
              aria-hidden
              className="pointer-events-none fixed z-[70] rounded-xl border border-accent/40 bg-ink/10 backdrop-blur-[2px]"
              style={(({ x, y, w, h }) => ({
                left: x,
                top: y,
                width: w,
                height: h,
              }))(snapRect(snapTarget))}
            />,
            document.body,
          )
        : null}

      {/* 테두리에 겹쳐 놓은 리사이즈 손잡이. 최대화·최소화 상태에서는 숨긴다. */}
      {maximized || minimized
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
