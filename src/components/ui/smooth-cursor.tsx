"use client";

import React, { useCallback, useEffect, useRef } from "react";

export interface SmoothCursorProps {
  className?: string;
  pointsCount?: number;
  lineWidth?: number;
  springStrength?: number;
  dampening?: number;
  color?: string;
  blur?: number;
  mixBlendMode?: GlobalCompositeOperation;
  velocityScale?: boolean;
  trailOpacity?: number;
  smoothFactor?: number;
}

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface CursorPosition {
  x: number;
  y: number;
}

const SmoothCursor: React.FC<SmoothCursorProps> = ({
  className = "",
  pointsCount = 40,
  lineWidth = 0.3,
  springStrength = 0.4,
  dampening = 0.5,
  color = "#000000",
  blur = 0,
  mixBlendMode = "source-over",
  velocityScale = false,
  trailOpacity = 1,
  smoothFactor = 1,
}) => {
  const safePointsCount = Math.max(Math.floor(pointsCount), 2);
  const safeDampening = Math.min(Math.max(dampening, 0.1), 0.99);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const cursorRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const cursorVisibleRef = useRef(true);
  const scaleRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const animateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
  }, [blur]);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    cursorRef.current = {
      x: canvas.offsetWidth * 0.5,
      y: canvas.offsetHeight * 0.5,
    };

    trailRef.current = Array.from({ length: safePointsCount }, () => ({
      x: cursorRef.current.x,
      y: cursorRef.current.y,
      vx: 0,
      vy: 0,
    }));
  }, [safePointsCount]);

  const updateCursorPosition = useCallback((x: number, y: number) => {
    cursorRef.current.x = x;
    cursorRef.current.y = y;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      updateCursorPosition(event.clientX - rect.left, event.clientY - rect.top);
    },
    [updateCursorPosition],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || event.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      updateCursorPosition(
        event.touches[0].clientX - rect.left,
        event.touches[0].clientY - rect.top,
      );
    },
    [updateCursorPosition],
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      updateCursorPosition(event.clientX - rect.left, event.clientY - rect.top);
    },
    [updateCursorPosition],
  );

  const handleDocumentMouseEnter = useCallback(() => {
    cursorVisibleRef.current = true;
  }, []);

  const handleDocumentMouseLeave = useCallback(() => {
    cursorVisibleRef.current = false;
  }, []);

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      const context = ctxRef.current;
      if (!canvas || !context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      trailRef.current.forEach((point, index) => {
        const target =
          index === 0 ? cursorRef.current : trailRef.current[index - 1];
        const spring = index === 0 ? 0.4 * springStrength : springStrength;

        point.vx += (target.x - point.x) * spring;
        point.vy += (target.y - point.y) * spring;
        point.vx *= safeDampening;
        point.vy *= safeDampening;
        point.x += point.vx;
        point.y += point.vy;
      });

      const targetScale = cursorVisibleRef.current ? 1 : 0;
      scaleRef.current += (targetScale - scaleRef.current) * 0.15;

      context.globalCompositeOperation = mixBlendMode;
      context.globalAlpha = scaleRef.current * trailOpacity;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(trailRef.current[0].x, trailRef.current[0].y);

      for (let index = 1; index < trailRef.current.length - 1; index++) {
        let velocityFactor = 1;
        if (velocityScale) {
          const point = trailRef.current[index];
          const velocity = Math.hypot(point.vx, point.vy);
          velocityFactor = 1 + Math.min(velocity * 0.5, 2);
        }

        const xMid =
          0.5 *
            (trailRef.current[index].x + trailRef.current[index + 1].x) *
            smoothFactor +
          trailRef.current[index].x * (1 - smoothFactor);
        const yMid =
          0.5 *
            (trailRef.current[index].y + trailRef.current[index + 1].y) *
            smoothFactor +
          trailRef.current[index].y * (1 - smoothFactor);

        context.quadraticCurveTo(
          trailRef.current[index].x,
          trailRef.current[index].y,
          xMid,
          yMid,
        );
        context.lineWidth =
          lineWidth * (safePointsCount - index) * velocityFactor;
        context.stroke();
      }

      const lastPoint = trailRef.current[trailRef.current.length - 1];
      context.lineTo(lastPoint.x, lastPoint.y);
      context.stroke();
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";

      // 자기 자신이 아니라 ref를 통해 예약해야 색 같은 prop이 바뀌었을 때
      // 다음 프레임부터 최신 그리기 함수로 갈아탄다.
      animationFrameRef.current = requestAnimationFrame(() =>
        animateRef.current?.(),
      );
    };

    animateRef.current = animate;
  }, [
    color,
    lineWidth,
    mixBlendMode,
    safeDampening,
    safePointsCount,
    smoothFactor,
    springStrength,
    trailOpacity,
    velocityScale,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    ctxRef.current = context;
    initializeCanvas();

    if (animateRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateRef.current);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", initializeCanvas);
    document.addEventListener("mouseenter", handleDocumentMouseEnter);
    document.addEventListener("mouseleave", handleDocumentMouseLeave);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", initializeCanvas);
      document.removeEventListener("mouseenter", handleDocumentMouseEnter);
      document.removeEventListener("mouseleave", handleDocumentMouseLeave);
    };
  }, [
    handleClick,
    handleDocumentMouseEnter,
    handleDocumentMouseLeave,
    handleMouseMove,
    handleTouchMove,
    initializeCanvas,
  ]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] h-full w-full ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

SmoothCursor.displayName = "SmoothCursor";

export default SmoothCursor;
