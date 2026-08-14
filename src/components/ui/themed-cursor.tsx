"use client";

import SmoothCursor from "@/components/ui/smooth-cursor";
import { useTheme } from "@/lib/theme";

/**
 * 테마에 맞는 색·합성 방식으로 커서 트레일을 그린다.
 * screen 합성은 밝은 배경에서 보이지 않아, 라이트 테마는
 * 어두운 금색을 multiply로 얹는다.
 */
export default function ThemedCursor() {
  const light = useTheme() === "light";

  return (
    <SmoothCursor
      pointsCount={25}                              // 트레일 길이
      lineWidth={0.15}                              // 선 굵기
      springStrength={0.3}                          // 포인터를 따라가는 힘
      dampening={0.54}                              // 움직임의 관성
      color={light ? "#3f6b67" : "#e6b34e"}     // 트레일 색상
      blur={3}                                      // 빛 번짐 정도
      mixBlendMode={light ? "multiply" : "screen"}  // 밝은 배경엔 multiply, 어두운 배경엔 screen
      velocityScale                                 // 이동 속도에 따라 선 굵기 변경
      trailOpacity={light ? 0.55 : 0.7}             // 전체 투명도: 0~1
      smoothFactor={1.15}                           // 곡선의 부드러움
    />
  );
}
