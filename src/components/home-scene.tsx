"use client";

import {
  FolderKanban,
  Gamepad2,
  House,
  NotebookPen,
  Pause,
  Play,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import AboutSection from "@/components/sections/about-section";
import Dock, { type DockItemData } from "@/components/ui/dock";
import MaskedHeading from "@/components/ui/masked-heading";
import WireframeBall from "@/components/ui/wireframe-ball";

type NavigationSection =
  | "home"
  | "about"
  | "projects"
  | "playground"
  | "devlog";

export default function HomeScene() {
  // 재생 상태와 현재 선택된 하단 메뉴를 각각 독립적으로 관리한다.
  const [paused, setPaused] = useState(false);
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("home");

  const activeItemClass = (section: NavigationSection) =>
    activeSection === section
      ? "border-[#8ddbf2]/70 bg-[#8ddbf2]/15 text-white"
      : undefined;

  // 메인 Dock에 표시할 메뉴 목록이다.
  const navigationItems: DockItemData[] = [
    {
      icon: <House aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Home",
      onClick: () => setActiveSection("home"),
      className: activeItemClass("home"),
      active: activeSection === "home",
    },
    {
      icon: <UserRound aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "About Me",
      onClick: () => setActiveSection("about"),
      className: activeItemClass("about"),
      active: activeSection === "about",
    },
    {
      icon: <FolderKanban aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Projects",
      onClick: () => setActiveSection("projects"),
      className: activeItemClass("projects"),
      active: activeSection === "projects",
    },
    {
      icon: <Gamepad2 aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Playground",
      onClick: () => setActiveSection("playground"),
      className: activeItemClass("playground"),
      active: activeSection === "playground",
    },
    {
      icon: <NotebookPen aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Devlog",
      onClick: () => setActiveSection("devlog"),
      className: activeItemClass("devlog"),
      active: activeSection === "devlog",
    },
  ];

  // 재생 제어는 메인 메뉴와 분리된 오른쪽 Dock에 표시한다.
  const playbackItems: DockItemData[] = [
    {
      icon: paused ? (
        <Play aria-hidden="true" size={20} strokeWidth={1.7} />
      ) : (
        <Pause aria-hidden="true" size={20} strokeWidth={1.7} />
      ),
      label: paused ? "재생" : "일시 정지",
      onClick: () => setPaused((value) => !value),
    },
  ];

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      {/* 하단 메뉴 선택과 무관하게 홈 배경을 고정해서 표시한다. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: "url('/background/background1.jpg')" }}
      />

      {/* 배경 위에 어두운 그라데이션을 겹쳐 와이어프레임의 명암 대비를 확보한다. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_68%_44%,transparent_0%,rgba(7,3,14,0.18)_32%,rgba(7,3,14,0.88)_100%)]"
      />

      <div
        className="absolute left-8 top-8 z-30 w-[min(82vw,32rem)]" // 좌상단 위치, 레이어 순서, 반응형 너비
      >
        <MaskedHeading
          text="Belog"                        // 화면에 표시할 문구
          tag="h1"                            // 시맨틱 HTML 태그
          mediaType="video"                   // 글자 내부에 표시할 미디어 종류
          src="/background/sky_video.mp4"     // 글자에 마스킹할 비디오 경로
          poster="/background/sky.jpg"        // 비디오가 로드되기 전에 표시할 이미지
          fillScale={1.35}                    // 글자 내부 이미지 확대 비율
          parallax={24}                       // 마우스 이동에 따른 이미지 이동 거리(px)
          drift={10}                          // 이미지의 느린 자동 움직임 크기(px)
          brightness={1}                      // 글자 내부 이미지 밝기
          saturation={1.1}                    // 글자 내부 이미지 채도
          reveal="wipe"                       // 문구가 나타나는 애니메이션 방식
          trigger="mount"                     // 페이지가 열릴 때 애니메이션 실행
          duration={1.2}                      // 등장 애니메이션 시간(초)
          align="left"                        // 문구 가로 정렬
          weight={700}                        // 글자 굵기
          tracking={-0.020}                   // 글자 간격(em)
          lineHeight={1.08}                   // g, y처럼 아래로 내려오는 글자가 잘리지 않는 줄 높이
          textScale={0.15}                     // 컨테이너 너비 대비 글자 크기 비율
        />
      </div>

      <WireframeBall
        shape="icosahedron"                     // 하단 메뉴 선택과 무관하게 표시할 고정 도형
        detail={1}                               // 표면 분할 단계: 높을수록 선과 꼭짓점이 많아짐
        zoom={1.08}                              // 오브젝트 확대 비율
        speed={0.72}                             // 자동 회전 속도
        wobble={0.018}                           // 크기가 미세하게 흔들리는 정도
        edgeColor="#fffefc"                      // 모서리 선 색상
        edgeGlow={0.6}                           // 모서리 선의 발광 강도
        edgeThickness={0.010}                    // 모서리 선 굵기
        vertexColor="#fcf0d9"                    // 꼭짓점 색상
        vertexSize={0.03}                        // 꼭짓점 크기
        vertexGlow={0.21}                        // 꼭짓점 발광 강도
        depthColor="#521c02"                     // 뒤쪽 면에 적용할 깊이 색상
        depthTint={0.72}                         // 깊이 색상을 섞는 비율
        depthFade={0.32}                         // 뒤쪽 요소의 흐려지는 정도
        cursorTilt={0.42}                        // 커서 이동에 반응하는 기울기
        spinFriction={0.95}                      // 드래그 회전 후 적용되는 감속 마찰
        paused={paused}                          // 자동 애니메이션 정지 여부
        className={
          "absolute inset-0 cursor-grab text-fuchsia-100 active:cursor-grabbing"
        }                                        // 전체 화면 배치 및 드래그 커서
      />

      {/* 배경은 그대로 두고 선택된 섹션의 창만 띄운다. 창을 닫으면 홈으로 돌아간다. */}
      {activeSection === "about" ? (
        <AboutSection onClose={() => setActiveSection("home")} />
      ) : null}

      {/*
        Dock의 바깥 래퍼는 포인터 이벤트를 무시하고,
        실제 Dock만 pointer-events-auto로 활성화해 장면 드래그를 방해하지 않는다.
      */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex h-40 origin-bottom scale-[0.82] items-end justify-center gap-3 pb-3 sm:scale-100">
        <Dock
          items={navigationItems}
          ariaLabel="주요 메뉴"
          floating={false}
          distance={150}
          panelHeight={62}
          baseItemSize={46}
          dockHeight={112}
          magnification={66}
          className="pointer-events-auto"
        />
        <Dock
          items={playbackItems}
          ariaLabel="애니메이션 제어"
          floating={false}
          distance={110}
          panelHeight={62}
          baseItemSize={46}
          dockHeight={112}
          magnification={66}
          className="pointer-events-auto"
        />
      </div>
    </main>
  );
}
