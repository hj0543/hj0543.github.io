"use client";

import { useInView, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

/** ReactBits CountUp의 TypeScript/Tailwind 구현을 Next.js용으로 옮긴 컴포넌트. */
export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // 목표 숫자는 MotionValue로 바꾸고 실제 화면 값은 spring의 중간값을 구독한다.
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const springValue = useSpring(motionValue, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  // 시작값과 끝값 중 더 긴 소수 자릿수를 유지해 애니메이션 중 폭 변화를 줄인다.
  const decimalPlaces = (value: number) => {
    const decimals = value.toString().split(".")[1];
    return decimals && Number.parseInt(decimals, 10) !== 0 ? decimals.length : 0;
  };
  const maxDecimals = Math.max(decimalPlaces(from), decimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const formatted = new Intl.NumberFormat("en-US", {
        useGrouping: Boolean(separator),
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(latest);

      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    // effect가 시작되기 전에도 올바른 시작 숫자가 보이도록 DOM 텍스트를 동기화한다.
    if (ref.current) {
      ref.current.textContent = formatValue(direction === "down" ? to : from);
    }
  }, [direction, formatValue, from, to]);

  useEffect(() => {
    if (!isInView || !startWhen) return;

    // ReactBits API의 초 단위 delay·duration에 맞춰 시작과 완료 콜백을 예약한다.
    onStart?.();
    const startTimer = window.setTimeout(() => {
      motionValue.set(direction === "down" ? from : to);
    }, delay * 1000);
    const endTimer = window.setTimeout(() => {
      onEnd?.();
    }, (delay + duration) * 1000);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
    };
  }, [delay, direction, duration, from, isInView, motionValue, onEnd, onStart, startWhen, to]);

  useEffect(() => {
    // spring은 매 프레임 React 렌더를 만들지 않고 span의 텍스트만 직접 갱신한다.
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });

    return unsubscribe;
  }, [formatValue, springValue]);

  return <span ref={ref} className={className} />;
}
