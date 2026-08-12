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
  DevlogDoc,
  DevlogSection,
  type DevlogPost,
} from "@/components/sections/devlog-section";
import {
  ProjectDoc,
  ProjectsSection,
  type Project,
} from "@/components/sections/projects-section";
import Dock, { type DockItemData } from "@/components/ui/dock";
import MaskedHeading from "@/components/ui/masked-heading";
import WindowFrame from "@/components/ui/window-frame";
import WireframeBall from "@/components/ui/wireframe-ball";

/** 열 수 있는 창의 종류. 프로젝트·글 상세는 "docs" 창 하나가 탭으로 품는다. */
type WindowId = "about" | "projects" | "devlog" | "docs";

/** docs 창의 탭 하나. 접두사로 어느 목록에서 찾을지 구분한다. */
type DocId = `project:${string}` | `post:${string}`;

/** "project:ait" → "ait.md" */
function docLabel(docId: DocId) {
  return `${docId.slice(docId.indexOf(":") + 1)}.md`;
}

const CASCADE = 40; // 창이 하나씩 늘 때마다 어긋나게 놓을 거리(px)
const ACTIVE_ITEM = "border-[#8ddbf2]/70 bg-[#8ddbf2]/15 text-white";

export default function HomeScene({
  posts,
  projects,
}: {
  posts: DevlogPost[];
  projects: Project[];
}) {
  const [paused, setPaused] = useState(false);
  // 배열 순서가 곧 쌓임 순서다. 마지막 항목이 맨 앞 창.
  const [stack, setStack] = useState<WindowId[]>([]);
  // docs 창이 품고 있는 탭 목록과 그중 보고 있는 탭.
  const [docs, setDocs] = useState<DocId[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocId | null>(null);
  // 보고 있던 탭을 또 눌렀을 때도 창이 펼쳐지도록 문서를 띄운 횟수를 센다.
  const [docReveal, setDocReveal] = useState(0);

  const focusWindow = useCallback((id: WindowId) => {
    setStack((prev) =>
      prev.at(-1) === id ? prev : [...prev.filter((w) => w !== id), id],
    );
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setStack((prev) => prev.filter((w) => w !== id));
    // docs 창을 닫으면 열려 있던 탭도 함께 버린다.
    if (id === "docs") {
      setDocs([]);
      setActiveDoc(null);
    }
  }, []);

  const closeAllWindows = useCallback(() => {
    setStack([]);
    setDocs([]);
    setActiveDoc(null);
  }, []);

  /** 이미 열려 있는 문서면 그 탭으로 옮기고, 아니면 탭을 새로 만든다. */
  const openDoc = useCallback(
    (docId: DocId) => {
      setDocs((prev) => (prev.includes(docId) ? prev : [...prev, docId]));
      setActiveDoc(docId);
      setDocReveal((count) => count + 1);
      focusWindow("docs");
    },
    [focusWindow],
  );

  const closeDoc = useCallback(
    (docId: DocId) => {
      const index = docs.indexOf(docId);
      const next = docs.filter((d) => d !== docId);

      setDocs(next);
      if (next.length === 0) {
        closeWindow("docs");
      } else if (activeDoc === docId) {
        // 닫은 탭이 보고 있던 탭이면 왼쪽 탭으로, 맨 왼쪽이었으면 오른쪽 탭으로 옮긴다.
        setActiveDoc(next[Math.max(index - 1, 0)]);
      }
    },
    [docs, activeDoc, closeWindow],
  );

  // 맨 앞 창을 한 단계만 닫는다. docs 창은 탭이 여러 개면 보고 있는 탭만 닫는다.
  const closeTopWindow = useCallback(() => {
    const top = stack.at(-1);
    if (!top) return;
    if (top === "docs" && activeDoc && docs.length > 1) {
      closeDoc(activeDoc);
      return;
    }
    closeWindow(top);
  }, [stack, activeDoc, docs.length, closeDoc, closeWindow]);

  // Escape는 맨 앞 창 하나만 닫는다.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTopWindow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeTopWindow]);

  const activeItemClass = (id: WindowId) =>
    stack.includes(id) ? ACTIVE_ITEM : undefined;

  const findPost = (docId: DocId) =>
    posts.find((p) => `post:${p.slug}` === docId);
  const findProject = (docId: DocId) =>
    projects.find((p) => `project:${p.slug}` === docId);

  // 제목줄에 나열할 탭. 목록에서 사라진 문서는 조용히 걸러낸다.
  const docTabs = docs
    .filter((docId) => findPost(docId) ?? findProject(docId))
    .map((docId) => ({ id: docId, label: docLabel(docId) }));

  // 메인 Dock에 표시할 메뉴 목록이다.
  const navigationItems: DockItemData[] = [
    {
      icon: <House aria-hidden="true" size={20} strokeWidth={1.7} />,
      label: "Home",
      // 홈은 열린 창을 모두 닫아 배경만 남긴다.
      onClick: closeAllWindows,
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
      onClick: () => focusWindow("devlog"),
      className: activeItemClass("devlog"),
      active: stack.includes("devlog"),
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
          className="[font-family:var(--font-geist-sans)]" // 좌상단 제목은 기존 Geist Sans 사용
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
        빈 바깥 영역을 누르면 맨 앞 창 하나만 닫는다.
      */}
      <div
        className={`fixed inset-0 z-40 ${
          stack.length > 0 ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) closeTopWindow();
        }}
      >
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
                projects={projects}
                onOpen={(slug) => openDoc(`project:${slug}`)}
                {...frame}
              />
            );
          }

          if (id === "devlog") {
            return (
              <DevlogSection
                key={id}
                posts={posts}
                onOpen={(slug) => openDoc(`post:${slug}`)}
                {...frame}
              />
            );
          }

          // 프로젝트와 글 상세를 탭으로 품는 창. 보고 있는 탭의 본문만 그린다.
          if (!activeDoc) return null;

          const post = findPost(activeDoc);
          const project = findProject(activeDoc);
          if (!post && !project) return null;

          return (
            <WindowFrame
              key={id}
              title={docLabel(activeDoc)}
              tabs={docTabs}
              activeTab={activeDoc}
              onSelectTab={setActiveDoc}
              onCloseTab={closeDoc}
              reveal={docReveal}
              defaultWidth={620}
              defaultHeight={560}
              {...frame}
            >
              {/* 탭을 바꿀 때 등장 애니메이션을 다시 재생하도록 key를 준다. */}
              {post ? <DevlogDoc key={activeDoc} post={post} /> : null}
              {project ? <ProjectDoc key={activeDoc} project={project} /> : null}
            </WindowFrame>
          );
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
