"use client";

import { useEffect, useState } from "react";

/** 창 제목줄 스타일. mac은 왼쪽 신호등 버튼, windows는 오른쪽 아이콘 버튼. */
export type WindowChrome = "mac" | "windows";

/** layout.tsx의 인라인 스크립트가 첫 페인트 전에 <html>에 넣어둔 값을 읽는다. */
function currentChrome(): WindowChrome {
  if (typeof document === "undefined") return "windows";
  return document.documentElement.dataset.chrome === "mac" ? "mac" : "windows";
}

/**
 * 현재 제목줄 스타일을 상태로 구독한다.
 * 테마와 같은 방식이라 창이 몇 개 열려 있든 prop 전달 없이 함께 바뀐다.
 */
export function useWindowChrome(): WindowChrome {
  const [chrome, setChrome] = useState<WindowChrome>(currentChrome);

  useEffect(() => {
    setChrome(currentChrome());
    const observer = new MutationObserver(() => setChrome(currentChrome()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-chrome"],
    });
    return () => observer.disconnect();
  }, []);

  return chrome;
}

export function toggleWindowChrome() {
  const next: WindowChrome = currentChrome() === "mac" ? "windows" : "mac";
  document.documentElement.dataset.chrome = next;
  try {
    localStorage.setItem("window-chrome", next);
  } catch {
    // 저장이 막힌 환경에서는 이번 방문 동안만 유지한다.
  }
}
