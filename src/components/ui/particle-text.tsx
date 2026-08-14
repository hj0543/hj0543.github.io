"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/** 텍스트 샘플링 밀도, 입자 물리, 상호작용과 정렬을 조절하는 공개 옵션. */
export interface ParticleTextProps {
  text?: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: "mount" | "hover" | "click";
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  horizontalAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}

type Rgb = { r: number; g: number; b: number };
type Target = { x: number; y: number; alpha: number };
type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  seed: number;
  depth: number;
  delay: number;
};

// 색상 보간은 캔버스가 바로 사용할 수 있는 RGB 값으로만 수행한다.
const hexToRgb = (hex: string): Rgb | null => {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount),
});

const rgbToCss = (rgb: Rgb): string =>
  `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const easeOutCubic = (time: number): number => 1 - Math.pow(1 - time, 3);

const resolveFontSize = (
  value: number | string,
  container: HTMLDivElement,
  fontWeight: number | string,
  fontFamily: string,
): number => {
  if (typeof value === "number") return value;

  // clamp(), rem 같은 CSS 글자 크기를 실제 px 값으로 얻기 위한 임시 측정 노드다.
  const probe = document.createElement("span");
  probe.textContent = "M";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.fontSize = value;
  probe.style.fontWeight = String(fontWeight);
  probe.style.fontFamily = fontFamily;
  container.appendChild(probe);
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
  probe.remove();
  return size;
};

const waitForFonts = async (font: string): Promise<void> => {
  if (!("fonts" in document)) return;

  try {
    await document.fonts.load(font);
  } catch {
    // 폰트 로드에 실패해도 시스템 대체 폰트로 파티클을 생성한다.
  }

  await document.fonts.ready;
};

/** 오프스크린 텍스트의 alpha 픽셀을 입자로 바꿔 canvas에 그린다. */
const ParticleText = ({
  text = "React Bits",
  particleSize = 2,
  density = 4,
  color = "#ffffff",
  highlightColor = "#8b5cf6",
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = "mount",
  fontSize = "clamp(3rem, 12vw, 8rem)",
  fontWeight = 800,
  fontFamily = "inherit",
  horizontalAlign = "center",
  verticalAlign = "center",
  glow = true,
  className = "",
  style,
}: ParticleTextProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    // 이 effect가 canvas의 입자 데이터, 관찰자, 이벤트와 RAF 생명주기를 전부 소유한다.
    let particles: Particle[] = [];
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    let buildId = 0;
    let gathering = false;
    let hoverScattered = false;
    let gatherStart = 0;
    let reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // 실제 포인터와 보간된 포인터를 분리해 반발력이 갑자기 튀지 않게 한다.
    const pointer = {
      active: false,
      x: 0,
      y: 0,
      smoothX: 0,
      smoothY: 0,
    };

    /** 현재 위치 또는 흩어진 위치에서 각 입자의 글자 목표점으로 수렴시킨다. */
    const startGather = (fromScatter = true): void => {
      if (!particles.length) return;

      const now = performance.now();
      const spread = reducedMotion ? 0 : scatter;

      particles.forEach((particle) => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2;
          const distance = spread * (0.35 + particle.depth * 0.75);
          particle.x =
            particle.targetX +
            Math.cos(angle) * distance +
            (particle.depth - 0.5) * spread * 0.55;
          particle.y =
            particle.targetY +
            Math.sin(angle) * distance +
            (particle.seed - 0.5) * spread * 0.55;
        }

        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = reducedMotion ? 0 : particle.seed * stagger;
      });

      gatherStart = now;
      gathering = true;
    };

    /** hover 모드에서 입자를 결정적인 seed 방향으로 흩어 놓는다. */
    const scatterForHover = (): void => {
      if (!particles.length || reducedMotion) return;

      particles.forEach((particle) => {
        const angle = particle.seed * Math.PI * 2;
        const distance = scatter * (0.35 + particle.depth * 0.75);
        particle.startX =
          particle.targetX +
          Math.cos(angle) * distance +
          (particle.depth - 0.5) * scatter * 0.55;
        particle.startY =
          particle.targetY +
          Math.sin(angle) * distance +
          (particle.seed - 0.5) * scatter * 0.55;
      });

      gathering = false;
      hoverScattered = true;
    };

    const drawParticle = (particle: Particle): void => {
      const size = particle.size;
      context.fillStyle = particle.color;

      if (size <= 2.1) {
        context.fillRect(
          particle.x - size / 2,
          particle.y - size / 2,
          size,
          size,
        );
        return;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
      context.fill();
    };

    /** 수렴·idle drift·포인터 반발을 합산해 한 프레임을 그린다. */
    const render = (now: number): void => {
      context.clearRect(0, 0, width, height);

      if (glow && !reducedMotion) {
        context.shadowBlur = particleSize * 3;
        context.shadowColor = highlightColor;
      } else {
        context.shadowBlur = 0;
      }

      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;

      let complete = true;

      particles.forEach((particle) => {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        let progress = 1;

        if (gathering) {
          const local =
            (now - gatherStart - particle.delay) /
            Math.max(1, reducedMotion ? 1 : gatherDuration);
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX =
            particle.startX + (particle.targetX - particle.startX) * eased;
          baseY =
            particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (hoverScattered) {
          baseX = particle.startX;
          baseY = particle.startY;
        } else if (!reducedMotion && idleDrift > 0) {
          const driftTime = now * 0.001;
          baseX +=
            Math.sin(driftTime * 0.9 + particle.seed * 10) *
            idleDrift *
            particle.depth;
          baseY +=
            Math.cos(driftTime * 0.75 + particle.depth * 10) *
            idleDrift *
            particle.depth;
        }

        // 반경 안에서는 거리가 가까울수록 제곱 비율로 더 강하게 밀어낸다.
        if (
          pointer.active &&
          !reducedMotion &&
          pointerRepel > 0 &&
          repelRadius > 0
        ) {
          const deltaX = baseX - pointer.smoothX;
          const deltaY = baseY - pointer.smoothY;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < repelRadius) {
            const force =
              Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
            baseX += (deltaX / distance) * force;
            baseY += (deltaY / distance) * force;
          }
        }

        const follow = reducedMotion ? 1 : 0.22;
        particle.x += (baseX - particle.x) * follow;
        particle.y += (baseY - particle.y) * follow;

        context.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1);
        drawParticle(particle);
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;

      if (gathering && complete) gathering = false;
      animationFrame = window.requestAnimationFrame(render);
    };

    const ensureRenderLoop = (): void => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    /** 글자를 오프스크린에 그린 뒤 alpha 픽셀을 새 입자 목표점으로 샘플링한다. */
    const sampleText = async (): Promise<void> => {
      const currentBuild = ++buildId;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width <= 0 || height <= 0) return;

      // 고해상도 화면에서도 메모리와 픽셀 처리량이 폭증하지 않도록 DPR 상한을 둔다.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const computed = window.getComputedStyle(container);
      const resolvedFamily =
        fontFamily === "inherit"
          ? computed.fontFamily || "sans-serif"
          : fontFamily;
      let resolvedSize = resolveFontSize(
        fontSize,
        container,
        fontWeight,
        resolvedFamily,
      );
      let font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;

      await waitForFonts(font);
      if (currentBuild !== buildId) return;

      // 실제 표시 canvas와 별개인 버퍼에서 텍스트 픽셀만 읽는다.
      const offscreen = document.createElement("canvas");
      const offscreenContext = offscreen.getContext("2d", {
        willReadFrequently: true,
      });
      if (!offscreenContext) return;

      const content = String(text || " ");
      const maxTextWidth = width * 0.92;
      offscreenContext.font = font;
      let metrics = offscreenContext.measureText(content);
      const measuredWidth = Math.max(1, metrics.width);
      // 긴 텍스트는 컨테이너 폭의 92% 안에 들어오도록 글자 크기를 한 번 축소한다.
      if (measuredWidth > maxTextWidth) {
        resolvedSize = Math.max(
          18,
          resolvedSize * (maxTextWidth / measuredWidth),
        );
        font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
        await waitForFonts(font);
        if (currentBuild !== buildId) return;
        offscreenContext.font = font;
        metrics = offscreenContext.measureText(content);
      }

      const left = Math.ceil(metrics.actualBoundingBoxLeft || 0);
      const right = Math.ceil(
        metrics.actualBoundingBoxRight || metrics.width,
      );
      const ascent = Math.ceil(
        metrics.actualBoundingBoxAscent || resolvedSize * 0.78,
      );
      const descent = Math.ceil(
        metrics.actualBoundingBoxDescent || resolvedSize * 0.22,
      );
      const padding = Math.max(12, Math.ceil(resolvedSize * 0.08));
      const textWidth = Math.max(1, left + right);
      const textHeight = Math.max(1, ascent + descent);

      offscreen.width = textWidth + padding * 2;
      offscreen.height = textHeight + padding * 2;
      offscreenContext.clearRect(0, 0, offscreen.width, offscreen.height);
      offscreenContext.font = font;
      offscreenContext.textAlign = "left";
      offscreenContext.textBaseline = "alphabetic";
      offscreenContext.fillStyle = "#ffffff";
      offscreenContext.fillText(content, padding - left, padding + ascent);

      const imageData = offscreenContext.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height,
      );
      const targets: Target[] = [];
      const step = Math.max(2, Math.floor(density));
      const targetLeft =
        horizontalAlign === "left"
          ? -padding
          : horizontalAlign === "right"
            ? width - offscreen.width + padding
            : width / 2 - offscreen.width / 2;
      const targetTop =
        verticalAlign === "top"
          ? -padding
          : verticalAlign === "bottom"
            ? height - offscreen.height + padding
            : height / 2 - offscreen.height / 2;

      // 완전히 투명한 픽셀은 버리고 density 간격으로 글자 내부만 순회한다.
      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const alpha = imageData.data[(y * offscreen.width + x) * 4 + 3];
          if (alpha > 40) {
            targets.push({
              x: targetLeft + x,
              y: targetTop + y,
              alpha: alpha / 255,
            });
          }
        }
      }

      // 화면 면적에 맞춘 상한으로 저사양 기기에서 지나친 입자 수를 방지한다.
      const maxParticles = Math.max(
        900,
        Math.min(5200, Math.floor((width * height) / 90)),
      );
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const baseRgb = hexToRgb(color);
      const highlightRgb = hexToRgb(highlightColor);
      const selected = targets.filter((_, index) => index % stride === 0);

      // 인덱스 기반 seed를 사용해 리사이즈 후에도 비슷한 분산 패턴을 재현한다.
      particles = selected.map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;
        const blend =
          baseRgb && highlightRgb
            ? clamp(
                target.x / Math.max(1, width) + (seed - 0.5) * 0.35,
                0,
                1,
              )
            : 0;
        const particleColor =
          baseRgb && highlightRgb
            ? rgbToCss(mixRgb(baseRgb, highlightRgb, blend))
            : color;
        const angle = seed * Math.PI * 2;
        const distance =
          (reducedMotion ? 0 : scatter) * (0.35 + depth * 0.75);
        const startX =
          target.x +
          Math.cos(angle) * distance +
          (seed - 0.5) * scatter * 0.45;
        const startY =
          target.y +
          Math.sin(angle) * distance +
          (depth - 0.9) * scatter * 0.45;

        return {
          x: reducedMotion ? target.x : startX,
          y: reducedMotion ? target.y : startY,
          startX,
          startY,
          targetX: target.x,
          targetY: target.y,
          size: Math.max(0.6, particleSize * (0.75 + target.alpha * 0.45)),
          color: particleColor,
          seed,
          depth,
          delay: seed * stagger,
        };
      });

      pointer.x = width / 2;
      pointer.y = height / 2;
      pointer.smoothX = pointer.x;
      pointer.smoothY = pointer.y;

      // hover 모드는 완성된 글자에서 시작하고, 모션 감소 환경은 모든 이동을 생략한다.
      if (reducedMotion || trigger === "hover") {
        particles.forEach((particle) => {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.startX = particle.targetX;
          particle.startY = particle.targetY;
          particle.delay = 0;
        });
        gathering = false;
        hoverScattered = false;
      } else {
        startGather(false);
      }

      ensureRenderLoop();
    };

    // ResizeObserver의 연속 호출을 한 animation frame 안에서 합친다.
    const queueSample = (): void => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(sampleText);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = (): void => {
      pointer.active = false;
      if (trigger === "hover" && hoverScattered) {
        hoverScattered = false;
        startGather(false);
      }
    };

    const handlePointerEnter = (event: PointerEvent): void => {
      handlePointerMove(event);
      if (trigger === "hover") scatterForHover();
    };

    const handleClick = (): void => {
      if (trigger === "click") startGather(true);
    };

    // 접근성 설정이 실행 중 바뀌어도 입자 상태를 즉시 다시 만든다.
    const reduceMotionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    const handleReduceMotionChange = (event: MediaQueryListEvent): void => {
      reducedMotion = event.matches;
      void sampleText();
    };

    reduceMotionQuery?.addEventListener("change", handleReduceMotionChange);
    canvas.addEventListener("pointerenter", handlePointerEnter);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);

    const resizeObserver = new ResizeObserver(queueSample);
    resizeObserver.observe(container);
    void sampleText();

    return () => {
      // 비동기 폰트 로드 결과와 예약된 프레임이 unmount 후 반영되지 않게 모두 무효화한다.
      buildId += 1;
      resizeObserver.disconnect();
      reduceMotionQuery?.removeEventListener(
        "change",
        handleReduceMotionChange,
      );
      canvas.removeEventListener("pointerenter", handlePointerEnter);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [
    text,
    particleSize,
    density,
    color,
    highlightColor,
    scatter,
    gatherDuration,
    stagger,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
    horizontalAlign,
    verticalAlign,
    glow,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative block h-full min-h-[240px] w-full touch-none overflow-hidden ${className}`}
      style={style}
      aria-label={text}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-hidden="true"
      />
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default ParticleText;
