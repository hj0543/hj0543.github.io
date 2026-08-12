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
import { useCallback, useEffect, useState } from "react";

import AboutSection from "@/components/sections/about-section";
import {
  ProjectsSection,
  ProjectWindow,
  projects,
} from "@/components/sections/projects-section";
import Dock, { type DockItemData } from "@/components/ui/dock";
import MaskedHeading from "@/components/ui/masked-heading";
import WireframeBall from "@/components/ui/wireframe-ball";

/** 열 수 있는 창의 종류. 프로젝트 상세는 프로젝트마다 창이 하나씩 생긴다. */
type WindowId = "about" | "projects" | `project:${string}`;

const CASCADE = 40; // 창이 하나씩 늘 때마다 어긋나게 놓을 거리(px)
const ACTIVE_ITEM = "border-[#8ddbf2]/70 bg-[#8ddbf2]/15 text-white";

export default function HomeScene() {
  const [paused, setPaused] = useState(false);
  // 배열 순서가 곧 쌓임 순서다. 마지막 항목이 맨 앞 창.
  const [stack, setStack] = useState<WindowId[]>([]);

  const focusWindow = useCallback((id: WindowId) => {
    setStack((prev) =>
      prev.at(-1) === id ? prev : [...prev.filter((w) => w !== id), id],
    );
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setStack((prev) => prev.filter((w) => w !== id));
  }, []);

  // Escape는 맨 앞 창 하나만 닫는다.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStack((prev) => prev.slice(0, -1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeItemClass = (id: WindowId) =>
    stack.includes(id) ? ACTIVE_ITEM : undefined;

  // 메인 Dock에 표시할 메뉴 목록이다.
  const navigationItems: DockItemData[] = [
    {
      icon: <House aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Home",
      // 홈은 열린 창을 모두 닫아 배경만 남긴다.
      onClick: () => setStack([]),
      className: stack.length === 0 ? ACTIVE_ITEM : undefined,
      active: stack.length === 0,
    },
    {
      icon: <UserRound aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "About Me",
      onClick: () => focusWindow("about"),
      className: activeItemClass("about"),
      active: stack.includes("about"),
    },
    {
      icon: <FolderKanban aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Projects",
      onClick: () => focusWindow("projects"),
      className: activeItemClass("projects"),
      active: stack.includes("projects"),
    },
    {
      icon: <Gamepad2 aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Playground",
      onClick: () => {},
    },
    {
      icon: <NotebookPen aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Devlog",
      onClick: () => {},
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

      {/*
        배경은 그대로 두고 열린 창만 겹쳐서 띄운다.
        래퍼는 포인터 이벤트를 흘려보내서 창 바깥에서는 배경 도형을 계속 드래그할 수 있다.
      */}
      <div className="pointer-events-none fixed inset-0 z-40">
        {stack.map((id, index) => {
          const frame = {
            z: index,
            offset: index * CASCADE,
            onFocus: () => focusWindow(id),
            onClose: () => closeWindow(id),
          };

          if (id === "about") return <AboutSection key={id} {...frame} />;

          if (id === "projects") {
            return (
              <ProjectsSection
                key={id}
                onOpen={(projectId) => focusWindow(`project:${projectId}`)}
                {...frame}
              />
            );
          }

          const project = projects.find((p) => `project:${p.id}` === id);
          return project ? (
            <ProjectWindow key={id} project={project} {...frame} />
          ) : null;
        })}
      </div>

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
