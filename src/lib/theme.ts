"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

/** layout.tsx의 인라인 스크립트가 첫 페인트 전에 <html>에 넣어둔 값을 읽는다. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * 현재 테마를 상태로 구독한다.
 * 전환은 <html data-theme>를 고치는 것뿐이라, 어디서 바뀌든
 * MutationObserver로 같은 값을 보게 된다(컨텍스트 전달이 필요 없다).
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    setTheme(currentTheme());
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function toggleTheme() {
  const next: Theme = currentTheme() === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // 시크릿 모드 등 저장이 막힌 환경에서는 이번 방문 동안만 유지한다.
  }
}
