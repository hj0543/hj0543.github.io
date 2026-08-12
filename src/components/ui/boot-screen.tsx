"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/** 부팅 로그. ok가 true면 줄 끝의 OK를 액센트색으로 찍는다. */
const LINES: { text: string; ok?: boolean }[] = [
  { text: "BELOG BIOS v1.0 — initializing" },
  { text: "memory check .................", ok: true },
  { text: "loading window manager .......", ok: true },
  { text: "mounting /projects ...........", ok: true },
  { text: "mounting /devlog .............", ok: true },
  { text: "starting belog.exe" },
  { text: "" },
  { text: "Welcome, visitor." },
];

const LINE_DELAY = 170; // 줄과 줄 사이 간격(ms)
const HOLD = 600; // 마지막 줄 이후 머무는 시간(ms)
const FADE = 500; // 사라지는 시간(ms). CSS duration과 맞춘다.

const STORAGE_KEY = "belog-booted";

/**
 * 첫 진입에만 보여주는 가짜 부팅 화면.
 * - idle: 서버 렌더와 같은 불투명 덮개만. 첫 페인트 전에 booting/done으로 갈린다.
 * - 같은 탭 세션에서는 다시 보이지 않는다(새 방문에는 다시 보인다).
 */
export default function BootScreen() {
  const [phase, setPhase] = useState<"idle" | "booting" | "fading" | "done">(
    "idle",
  );
  const [visible, setVisible] = useState(0);

  // 첫 페인트 전에 결정해서 재방문 때 덮개가 번쩍이지 않게 한다.
  useLayoutEffect(() => {
    try {
      setPhase(sessionStorage.getItem(STORAGE_KEY) ? "done" : "booting");
    } catch {
      setPhase("done");
    }
  }, []);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 저장이 막혀도 이번 화면만 넘기면 된다.
    }
    setPhase((current) => (current === "booting" ? "fading" : current));
  }, []);

  // 로그를 한 줄씩 찍고, 다 찍으면 잠깐 멈췄다가 사라진다.
  useEffect(() => {
    if (phase !== "booting") return;
    const timer = setTimeout(
      () => (visible >= LINES.length ? finish() : setVisible((v) => v + 1)),
      visible >= LINES.length ? HOLD : LINE_DELAY,
    );
    return () => clearTimeout(timer);
  }, [phase, visible, finish]);

  // 아무 키·클릭이면 건너뛴다.
  useEffect(() => {
    if (phase !== "booting") return;
    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, [phase, finish]);

  // 페이드가 끝나면 완전히 걷어낸다.
  useEffect(() => {
    if (phase !== "fading") return;
    const timer = setTimeout(() => setPhase("done"), FADE);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-background p-6 font-mono text-[13px] leading-relaxed text-foreground/80 transition-opacity duration-500 sm:p-10 ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div>
        {LINES.slice(0, visible).map(({ text, ok }, index) => (
          <div key={index}>
            {text}
            {ok ? <span className="text-accent"> OK</span> : null}
          </div>
        ))}
        {phase === "booting" ? (
          <span className="ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse bg-foreground/70" />
        ) : null}
      </div>

      <p className="text-[11px] text-foreground/35">
        아무 키나 누르면 건너뜁니다
      </p>
    </div>
  );
}
