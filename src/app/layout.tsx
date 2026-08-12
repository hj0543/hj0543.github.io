import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import BootScreen from "@/components/ui/boot-screen";
import ThemedCursor from "@/components/ui/themed-cursor";
import "./globals.css";

// 좌상단 제목에서만 사용할 기존 Geist Sans를 등록한다.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// next/font가 내려받은 JetBrains Mono를 전역 CSS 변수로 등록한다.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// 한글용 Pretendard(가변). JetBrains Mono에 없는 한글 글리프가 이 폰트로 떨어진다.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

// 모든 페이지에서 공통으로 사용하는 기본 문서 메타데이터다.
export const metadata: Metadata = {
  title: "Belog",
};

// 저장해 둔 테마(없으면 시스템 설정)와 창 제목줄 스타일을 첫 페인트 전에
// <html>에 적용해 새로고침할 때 화면이 번쩍이는 것을 막는다.
const THEME_INIT = `(function () {
  try {
    var theme = localStorage.getItem("theme");
    if (theme !== "light" && theme !== "dark") {
      theme = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    document.documentElement.dataset.theme = theme;
    var chrome = localStorage.getItem("window-chrome");
    document.documentElement.dataset.chrome = chrome === "mac" ? "mac" : "windows";
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.chrome = "windows";
  }
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 위 스크립트가 하이드레이션 전에 넣으므로 경고를 끈다.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${pretendard.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* 각 route의 페이지 컴포넌트가 이 위치에 렌더링된다. */}
        {children}

        {/* 첫 진입에만 보이는 부팅 화면. 세션 안에서는 다시 뜨지 않는다. */}
        <BootScreen />
        <ThemedCursor />
      </body>
    </html>
  );
}
