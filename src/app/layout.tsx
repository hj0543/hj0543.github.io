import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothCursor from "@/components/ui/smooth-cursor";
import "./globals.css";

// next/font가 내려받은 Geist Sans를 전역 CSS 변수로 등록한다.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 코드나 숫자 표시에 사용할 Geist Mono를 전역 CSS 변수로 등록한다.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 모든 페이지에서 공통으로 사용하는 기본 문서 메타데이터다.
export const metadata: Metadata = {
  title: "HJ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 각 route의 페이지 컴포넌트가 이 위치에 렌더링된다. */}
        {children}

        <SmoothCursor
          pointsCount={25}                // 트레일 길이
          lineWidth={0.15}                // 선 굵기
          springStrength={0.3}            // 포인터를 따라가는 힘
          dampening={0.54}                // 움직임의 관성
          color="#e6b34e"                 // 트레일 색상
          blur={3}                        // 빛 번짐 정도
          mixBlendMode="screen"           // 배경과 색상을 합성하는 방식
          velocityScale                   // 이동 속도에 따라 선 굵기 변경
          trailOpacity={0.7}             // 전체 투명도: 0~1
          smoothFactor={1.15}             // 곡선의 부드러움
        />
      </body>
    </html>
  );
}
