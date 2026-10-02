import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./globals.css";

// next/font가 내려받은 JetBrains Mono를 전역 CSS 변수로 등록한다.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// 본문용 Pretendard(가변).
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

// 모든 페이지에서 공통으로 사용하는 기본 문서 메타데이터다.
export const metadata: Metadata = {
  title: "Belog",
  description: "Hyeonjin Jeong의 기획·데이터 포트폴리오",
};

// 저장해 둔 테마(없으면 시스템 설정)를 첫 페인트 전에 <html>에 적용해
// 새로고침할 때 화면이 번쩍이는 것을 막는다.
const THEME_INIT = `(function () {
  try {
    var theme = localStorage.getItem("theme");
    if (theme !== "light" && theme !== "dark") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 위 스크립트가 하이드레이션 전에 넣으므로 경고를 끈다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${pretendard.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body id="top" className="flex min-h-full flex-col">
        <SiteHeader />
        {/* 각 route의 페이지 컴포넌트가 이 위치에 렌더링된다. */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
