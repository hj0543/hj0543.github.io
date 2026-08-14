"use client";

import {
  AnimatePresence,
  motion,
  type MotionValue,
  type SpringOptions,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import React, {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  active?: boolean;
};

/** Dock 전체의 크기와 마우스 근접 확대 효과를 조절하는 공개 옵션. */
export type DockProps = {
  items: DockItemData[];
  className?: string;
  ariaLabel?: string;
  floating?: boolean;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  label?: React.ReactNode;
  active?: boolean;
};

/** 마우스와의 거리에 따라 크기가 변하는 개별 Dock 항목. */
function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  active,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  // 전역 포인터 X 좌표를 각 아이콘 중심으로부터의 상대 거리로 변환한다.
  const mouseDistance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return value - rect.x - rect.width / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  // 목표 크기를 바로 적용하지 않고 spring을 거쳐 macOS Dock처럼 부드럽게 확대한다.
  const size = useSpring(targetSize, spring);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-ink/[0.08] text-foreground/90 shadow-[0_10px_35px_rgba(0,0,0,0.3)] outline-none backdrop-blur-md transition-colors hover:border-accent/45 hover:bg-accent/12 focus-visible:ring-2 focus-visible:ring-accent/70 ${className}`}
      tabIndex={0}
      role="button"
      aria-label={typeof label === "string" ? label : undefined}
      aria-pressed={active}
    >
      {/* Label 자식에 hover MotionValue를 주입해 아이콘과 툴팁 상태를 동기화한다. */}
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(
              child as React.ReactElement<{
                isHovered?: MotionValue<number>;
              }>,
              { isHovered },
            )
          : child,
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({
  children,
  className = "",
  isHovered,
}: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // React state는 툴팁 마운트에만 쓰고, 고빈도 hover 값은 MotionValue로 전달한다.
  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-nowrap rounded-md border border-ink/15 bg-surface/90 px-2 py-1 text-[11px] text-foreground shadow-lg backdrop-blur-md`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = "" }: DockIconProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

export default function Dock({
  items,
  className = "",
  ariaLabel = "Application dock",
  floating = true,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
}: DockProps) {
  // 한 개의 포인터 값을 모든 항목이 공유해야 인접 아이콘도 함께 확대된다.
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  // 확대된 아이콘과 툴팁이 잘리지 않도록 Dock 바깥 래퍼 높이도 함께 늘린다.
  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [dockHeight, magnification],
  );
  const heightRow = useTransform(
    isHovered,
    [0, 1],
    [panelHeight, maxHeight],
  );
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height, scrollbarWidth: "none" }}
      className={`flex max-w-full ${floating ? "mx-2 items-center" : "items-end"}`}
    >
      <motion.div
        onMouseMove={({ clientX }) => {
          isHovered.set(1);
          mouseX.set(clientX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} ${floating ? "absolute bottom-3 left-1/2 -translate-x-1/2" : "relative"} flex w-fit items-end gap-3 rounded-[1.4rem] border border-ink/15 bg-surface/55 px-3 pb-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label={ariaLabel}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            active={item.active}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
