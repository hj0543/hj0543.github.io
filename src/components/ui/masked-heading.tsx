"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import type { CSSProperties, ElementType, FC } from "react";

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

type Reveal = "rise" | "wipe" | "fade" | "none";
type Trigger = "view" | "mount" | "hover";

/** 텍스트 윤곽 안에 이미지나 영상을 채우고 등장·시차 효과를 적용하는 제목 옵션. */
export interface MaskedHeadingProps {
  text?: string;
  tag?: ElementType;
  mediaType?: "image" | "video";
  src?: string;
  poster?: string;
  fillScale?: number;
  parallax?: number;
  drift?: number;
  brightness?: number;
  saturation?: number;
  grayscale?: boolean;
  reveal?: Reveal;
  duration?: number;
  stagger?: number;
  trigger?: Trigger;
  align?: "left" | "center" | "right";
  weight?: number;
  tracking?: number;
  lineHeight?: number;
  textScale?: number;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

// 투명 HTML 텍스트로 레이아웃을 잡고, 같은 좌표의 SVG 글자를 미디어 클리핑에 사용한다.
const MaskedHeading: FC<MaskedHeadingProps> = ({
  text = "Designed in the details",
  tag = "h2",
  mediaType = "image",
  src = "",
  poster = "",
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  reveal = "rise",
  duration = 1.1,
  stagger = 0.09,
  trigger = "view",
  align = "center",
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  className = "",
  style,
  ...rest
}: MaskedHeadingProps) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const revealRef = useRef<HTMLSpanElement | null>(null);
  const mediaRef = useRef<HTMLSpanElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const baseRefs = useRef<(HTMLElement | null)[]>([]);
  const glyphRefs = useRef<(SVGTextElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const words = useMemo(
    () => String(text).split(/\s+/).filter(Boolean),
    [text],
  );

  // 애니메이션 프레임에서 최신 props를 읽기 위한 미디어 설정값이다.
  const settingsRef = useRef({
    fillScale: 1,
    parallax: 0,
    drift: 0,
    brightness: 1,
    saturation: 1,
    grayscale: false,
    textScale: 0.115,
  });

  useEffect(() => {
    settingsRef.current = {
      fillScale,
      parallax,
      drift,
      brightness,
      saturation,
      grayscale,
      textScale,
    };
  }, [
    fillScale,
    parallax,
    drift,
    brightness,
    saturation,
    grayscale,
    textScale,
  ]);

  // 현재 포인터 및 드리프트 값을 미디어의 transform과 filter에 반영한다.
  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;

    const settings = settingsRef.current;
    const width = root.clientWidth;
    const height = root.clientHeight;
    const offset = offsetRef.current;
    const maxX = Math.max(0, ((settings.fillScale - 1) / 2) * width);
    const maxY = Math.max(0, ((settings.fillScale - 1) / 2) * height);

    media.style.transform = `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(2)}px, ${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${settings.fillScale})`;
    media.style.filter = `brightness(${settings.brightness}) saturate(${settings.saturation})${settings.grayscale ? " grayscale(1)" : ""}`;
  }, []);

  // 컨테이너 크기에 맞춰 글자 크기와 SVG 클리핑 문자의 좌표를 동기화한다.
  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;

    const settings = settingsRef.current;
    root.style.fontSize = `${clamp(root.clientWidth * settings.textScale, 20, 200).toFixed(1)}px`;

    const computed = window.getComputedStyle(measure);
    for (let index = 0; index < wordRefs.current.length; index += 1) {
      const box = wordRefs.current[index];
      const base = baseRefs.current[index];
      const glyph = glyphRefs.current[index];
      if (!box || !base || !glyph) continue;

      glyph.setAttribute("x", `${box.offsetLeft}`);
      glyph.setAttribute("y", `${base.offsetTop}`);
      glyph.style.fontFamily = computed.fontFamily;
      glyph.style.fontSize = computed.fontSize;
      glyph.style.fontWeight = computed.fontWeight;
      glyph.style.fontStyle = computed.fontStyle;
      glyph.style.letterSpacing = computed.letterSpacing;
    }
    place();
  }, [place]);

  // 이미지의 자동 드리프트와 포인터 패럴랙스를 매 프레임 계산한다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);
    if (document.fonts?.ready) {
      document.fonts.ready.then(sync).catch(() => undefined);
    }

    let animationFrame = 0;
    let last = performance.now();
    let clock = 0;

    const frame = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += delta;
      const settings = settingsRef.current;
      const offset = offsetRef.current;
      const driftX = Math.sin(clock * 0.21) * settings.drift;
      const driftY = Math.cos(clock * 0.17) * settings.drift * 0.6;
      const ease = 1 - Math.exp(-delta / 0.18);

      offset.x += (offset.tx + driftX - offset.x) * ease;
      offset.y += (offset.ty + driftY - offset.y) * ease;
      place();
      animationFrame = requestAnimationFrame(frame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const settings = settingsRef.current;
      if (settings.parallax <= 0) return;
      const rect = root.getBoundingClientRect();
      const normalizedX =
        ((event.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const normalizedY =
        ((event.clientY - rect.top) / (rect.height || 1)) * 2 - 1;
      offsetRef.current.tx =
        clamp(normalizedX, -1, 1) * -settings.parallax;
      offsetRef.current.ty =
        clamp(normalizedY, -1, 1) * -settings.parallax;
    };

    const handlePointerLeave = () => {
      offsetRef.current.tx = 0;
      offsetRef.current.ty = 0;
    };

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    animationFrame = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [place, sync]);

  useEffect(() => {
    sync();
  }, [sync, words, tag, align, weight, tracking, lineHeight, textScale]);

  // GSAP으로 rise, wipe, fade 등장 효과와 실행 시점을 제어한다.
  useEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    if (!root || !layer) return;
    const glyphs = glyphRefs.current.filter(Boolean);
    if (!glyphs.length) return;

    const riseDistance = () =>
      (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15;
    const settle = () => {
      gsap.set(glyphs, { y: 0 });
      gsap.set(layer, {
        opacity: 1,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
      });
    };
    const rest = () => {
      if (reveal === "rise") {
        gsap.set(glyphs, { y: riseDistance() });
      } else if (reveal === "wipe") {
        gsap.set(layer, { clipPath: "inset(0% 100% 0% 0%)" });
      } else if (reveal === "fade") {
        gsap.set(layer, { opacity: 0, scale: 1.08 });
      }
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reveal === "none" || reducedMotion) {
      settle();
      return;
    }

    const play = () => {
      tweenRef.current?.kill();
      if (reveal === "rise") {
        gsap.set(layer, {
          opacity: 1,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
        });
        tweenRef.current = gsap.fromTo(
          glyphs,
          { y: riseDistance() },
          {
            y: 0,
            duration,
            stagger,
            ease: "power4.out",
            overwrite: "auto",
          },
        );
      } else if (reveal === "wipe") {
        gsap.set(glyphs, { y: 0 });
        const state = { progress: 100 };
        tweenRef.current = gsap.to(state, {
          progress: 0,
          duration,
          ease: "power3.inOut",
          overwrite: "auto",
          onUpdate: () => {
            layer.style.clipPath = `inset(0% ${state.progress}% 0% 0%)`;
          },
        });
      } else {
        gsap.set(glyphs, { y: 0 });
        tweenRef.current = gsap.fromTo(
          layer,
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            duration,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }
    };

    if (trigger === "hover") {
      settle();
      root.addEventListener("pointerenter", play);
      return () => {
        root.removeEventListener("pointerenter", play);
        tweenRef.current?.kill();
      };
    }

    if (trigger === "view") {
      settle();
      rest();
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play();
            observer.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(root);
      return () => {
        observer.disconnect();
        tweenRef.current?.kill();
      };
    }

    play();
    return () => tweenRef.current?.kill();
  }, [reveal, trigger, duration, stagger, words]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = tag as any;

  return (
    <Tag
      ref={rootRef}
      className={`relative m-0 w-full p-0 antialiased [text-wrap:balance] ${className}`.trim()}
      style={{
        textAlign: align,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        lineHeight,
        ...style,
      }}
      {...rest}
    >
      {/* 실제 문서 흐름과 단어별 좌표 측정을 담당하는 투명 레이어. */}
      <span ref={measureRef} className="text-transparent">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            ref={(element: HTMLSpanElement | null) => {
              wordRefs.current[index] = element;
            }}
            className="inline-block whitespace-pre [&:not(:last-child)]:after:content-['\00a0']"
          >
            {word}
            <i
              ref={(element: HTMLElement | null) => {
                baseRefs.current[index] = element;
              }}
              className="inline-block h-0 w-0"
            />
          </span>
        ))}
      </span>

      {/* 측정한 단어 좌표를 미디어에 재사용할 수 있는 SVG 클리핑 경로로 만든다. */}
      <svg
        className="absolute h-0 w-0 overflow-hidden"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, index) => (
              <text
                key={`${word}-${index}`}
                ref={(element: SVGTextElement | null) => {
                  glyphRefs.current[index] = element;
                }}
              >
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      {/* 클리핑된 미디어만 절대 배치해 원래 제목의 크기와 줄바꿈을 유지한다. */}
      <span
        ref={revealRef}
        className="pointer-events-none absolute inset-0 block"
      >
        <span
          className="absolute inset-0 block"
          style={{ clipPath: `url(#${clipId})` }}
        >
          <span
            ref={mediaRef}
            className="absolute inset-0 block [will-change:transform,filter]"
          >
            {mediaType === "video" ? (
              <video
                className="block h-full w-full select-none object-cover"
                src={src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="block h-full w-full select-none object-cover"
                src={src}
                alt=""
                draggable={false}
              />
            )}
          </span>
        </span>
      </span>
    </Tag>
  );
};

export default MaskedHeading;
