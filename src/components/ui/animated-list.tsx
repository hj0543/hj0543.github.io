"use client";

import {
  type Key,
  type ReactNode,
  type UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const DEFAULT_ITEMS = Array.from({ length: 15 }, (_, index) =>
  `Item ${index + 1}`,
);

type AnimatedItemProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  index: number;
  selected: boolean;
  tabIndex: number;
  onClick: () => void;
  onFocus: () => void;
  onMouseEnter: () => void;
};

function AnimatedItem({
  children,
  className,
  delay = 0,
  index,
  selected,
  tabIndex,
  onClick,
  onFocus,
  onMouseEnter,
}: AnimatedItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { amount: 0.35, once: false });
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      data-index={index}
      tabIndex={tabIndex}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
      animate={
        reduceMotion || inView
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.92, y: 12 }
      }
      transition={{ duration: reduceMotion ? 0 : 0.24, delay }}
      className={cn(
        "group mb-3 block w-full cursor-pointer text-left last:mb-0 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export type AnimatedListProps<T = string> = {
  items?: readonly T[];
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode;
  getItemKey?: (item: T, index: number) => Key;
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  ariaLabel?: string;
};

export default function AnimatedList<T = string>({
  items,
  renderItem,
  getItemKey,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className,
  listClassName,
  itemClassName,
  displayScrollbar = true,
  initialSelectedIndex = -1,
  ariaLabel = "Animated list",
}: AnimatedListProps<T>) {
  const resolvedItems = (items ?? DEFAULT_ITEMS) as readonly T[];
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.min(Math.max(initialSelectedIndex, -1), resolvedItems.length - 1),
  );
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(0);
  const activeSelectedIndex =
    selectedIndex >= resolvedItems.length
      ? resolvedItems.length - 1
      : selectedIndex;

  const updateGradients = useCallback((container: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = container;
    const bottomDistance = scrollHeight - scrollTop - clientHeight;

    setTopGradientOpacity(Math.min(scrollTop / 48, 1));
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 64, 1),
    );
  }, []);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    updateGradients(event.currentTarget);
  };

  const selectItem = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      onItemSelect?.(resolvedItems[index], index);
    },
    [onItemSelect, resolvedItems],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableArrowNavigation || resolvedItems.length === 0) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") {
      nextIndex = Math.min(activeSelectedIndex + 1, resolvedItems.length - 1);
    } else if (event.key === "ArrowUp") {
      nextIndex = Math.max(
        activeSelectedIndex < 0 ? 0 : activeSelectedIndex - 1,
        0,
      );
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = resolvedItems.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    setKeyboardNav(true);
    setSelectedIndex(nextIndex);
  };

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    updateGradients(container);
    const resizeObserver = new ResizeObserver(() => updateGradients(container));
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [resolvedItems.length, updateGradients]);

  useEffect(() => {
    if (!keyboardNav || activeSelectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const selectedItem = container.querySelector<HTMLButtonElement>(
      `[data-index="${activeSelectedIndex}"]`,
    );
    if (!selectedItem) return;

    selectedItem.focus({ preventScroll: true });
    const extraMargin = 48;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;

    if (itemTop < container.scrollTop + extraMargin) {
      container.scrollTo({
        top: Math.max(itemTop - extraMargin, 0),
        behavior: "smooth",
      });
    } else if (
      itemBottom >
      container.scrollTop + container.clientHeight - extraMargin
    ) {
      container.scrollTo({
        top: itemBottom - container.clientHeight + extraMargin,
        behavior: "smooth",
      });
    }

    setKeyboardNav(false);
  }, [activeSelectedIndex, keyboardNav]);

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        className={cn(
          "max-h-[400px] overflow-y-auto overscroll-contain p-1 pr-3",
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ink/20 hover:[&::-webkit-scrollbar-thumb]:bg-ink/30"
            : "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          listClassName,
        )}
        style={{
          scrollbarWidth: displayScrollbar ? "thin" : "none",
          scrollbarColor: displayScrollbar
            ? "color-mix(in srgb, var(--ink) 24%, transparent) transparent"
            : undefined,
        }}
      >
        {resolvedItems.map((entry, index) => {
          const selected = activeSelectedIndex === index;
          return (
            <AnimatedItem
              key={getItemKey?.(entry, index) ?? index}
              index={index}
              selected={selected}
              tabIndex={
                selected || (activeSelectedIndex < 0 && index === 0) ? 0 : -1
              }
              delay={Math.min(index * 0.025, 0.15)}
              className={itemClassName}
              onMouseEnter={() => setSelectedIndex(index)}
              onFocus={() => setSelectedIndex(index)}
              onClick={() => selectItem(index)}
            >
              {renderItem ? (
                renderItem(entry, index, selected)
              ) : (
                <span className="block rounded-lg bg-ink/6 p-4 text-foreground">
                  {String(entry)}
                </span>
              )}
            </AnimatedItem>
          );
        })}
      </div>

      {showGradients ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-surface via-surface/85 to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface via-surface/85 to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      ) : null}
    </div>
  );
}
