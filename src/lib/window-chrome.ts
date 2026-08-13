"use client";

import { useSyncExternalStore } from "react";

/** 창 제목줄 스타일. mac은 왼쪽 신호등 버튼, windows는 오른쪽 아이콘 버튼. */
export type WindowChrome = "mac" | "windows";

const DEFAULT_CHROME: WindowChrome = "windows";

/** layout.tsx의 인라인 스크립트가 첫 페인트 전에 <html>에 넣어둔 값을 읽는다. */
function currentChrome(): WindowChrome {
  if (typeof document === "undefined") return DEFAULT_CHROME;
  return document.documentElement.dataset.chrome === "mac" ? "mac" : "windows";
}

function subscribeToChrome(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-chrome"],
  });
  return () => observer.disconnect();
}

function serverChrome(): WindowChrome {
  return DEFAULT_CHROME;
}

/**
 * 현재 제목줄 스타일을 상태로 구독한다.
 * 테마와 같은 방식이라 창이 몇 개 열려 있든 prop 전달 없이 함께 바뀐다.
 */
export function useWindowChrome(): WindowChrome {
  return useSyncExternalStore(subscribeToChrome, currentChrome, serverChrome);
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
