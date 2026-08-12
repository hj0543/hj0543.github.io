"use client";

import { motion } from "motion/react";
import React, { useLayoutEffect, useRef, useState } from "react";

/** 메뉴 한 줄. "divider"는 구분선을 그린다. */
export type ContextMenuItem =
  | { icon?: React.ReactNode; label: string; onSelect: () => void }
  | "divider";

/**
 * 바탕화면 우클릭 메뉴. 여닫는 판단은 바깥(장면)이 하고,
 * 여기서는 위치 보정과 바깥 클릭 감지만 맡는다.
 */
export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  // 화면 가장자리에서 열면 메뉴가 잘리지 않게 안쪽으로 당긴다.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: Math.min(x, window.innerWidth - rect.width - 8),
      y: Math.min(y, window.innerHeight - rect.height - 8),
    });
  }, [x, y]);

  // 메뉴 밖을 누르면 닫는다. 캡처 단계라 창·Dock 클릭보다 먼저 돈다.
  useLayoutEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      role="menu"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      onContextMenu={(event) => event.preventDefault()}
      className="fixed z-[80] min-w-44 rounded-xl border border-ink/15 bg-surface/90 p-1.5 shadow-[var(--window-shadow)] backdrop-blur-xl"
      style={{ left: pos.x, top: pos.y }}
    >
      {items.map((item, index) =>
        item === "divider" ? (
          <div key={index} aria-hidden className="my-1 h-px bg-ink/10" />
        ) : (
          <button
            key={index}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left font-mono text-[12px] text-foreground/75 transition-colors hover:bg-ink/8 hover:text-foreground focus-visible:bg-ink/8 focus-visible:outline-none"
          >
            {item.icon ? (
              <span className="flex w-4 shrink-0 items-center justify-center text-foreground/55">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </button>
        ),
      )}
    </motion.div>
  );
}
