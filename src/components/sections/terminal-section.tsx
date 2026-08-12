"use client";

import { useEffect, useRef, useState } from "react";

import type { Project } from "@/components/sections/projects-section";
import WindowFrame from "@/components/ui/window-frame";
import { setTheme, toggleTheme, type Theme } from "@/lib/theme";

/** WindowFrame이 창 관리용으로 받는 값들. */
type FrameProps = {
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
};

/** 출력 한 줄. command는 프롬프트를 앞에 붙여 그린다. */
type Line = { id: number; kind: "command" | "output"; text: string };

const INTRO = [
  "Belog Terminal",
  "'help'를 입력하면 사용할 수 있는 명령어가 나옵니다.",
];

const HELP = [
  "help                 명령어 목록",
  "whoami               소개",
  "projects             프로젝트 목록",
  "open <이름>           창 열기 (about·projects·devlog 또는 프로젝트 이름)",
  "theme [dark|light]   테마 전환",
  "contact              연락처",
  "clear                화면 지우기",
];

export default function TerminalSection({
  projects,
  onOpenWindow,
  onOpenProject,
  ...frame
}: FrameProps & {
  projects: Project[];
  onOpenWindow: (id: "about" | "projects" | "devlog") => void;
  onOpenProject: (slug: string) => void;
}) {
  const [lines, setLines] = useState<Line[]>(() =>
    INTRO.map((text, id) => ({ id, kind: "output", text })),
  );
  const [value, setValue] = useState("");
  // 입력했던 명령을 위·아래 방향키로 다시 불러온다.
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const nextId = useRef(INTRO.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  /** 명령 하나를 실행하고 출력 줄들을 돌려준다. clear만 특별히 화면을 비운다. */
  const run = (raw: string): string[] => {
    const [command, ...args] = raw.trim().split(/\s+/);

    switch (command) {
      case "help":
        return HELP;

      case "whoami":
        return ["Hyeonjin Jeong — 함께 일하고 싶은 개발자 (SSAFY 15th)"];

      case "projects":
        return projects.map((p) => `${p.slug.padEnd(22)} ${p.name}`);

      case "open": {
        const target = args[0]?.toLowerCase();
        if (!target) return ["사용법: open <about|projects|devlog|프로젝트 이름>"];
        if (target === "about" || target === "projects" || target === "devlog") {
          onOpenWindow(target);
          return [`${target} 창을 열었습니다.`];
        }
        const project = projects.find((p) => p.slug.toLowerCase() === target);
        if (project) {
          onOpenProject(project.slug);
          return [`${project.name} 문서를 열었습니다.`];
        }
        return [`열 수 없습니다: ${target} ('projects'로 이름을 확인하세요)`];
      }

      case "theme": {
        const target = args[0]?.toLowerCase();
        if (target === "dark" || target === "light") {
          setTheme(target as Theme);
          return [`${target} 테마로 전환했습니다.`];
        }
        if (target) return ["사용법: theme [dark|light]"];
        toggleTheme();
        return ["테마를 전환했습니다."];
      }

      case "contact":
        return [
          "GitHub  https://github.com/hj0543",
          "Email   hj0543@gmail.com",
        ];

      case "sudo":
        return [
          "visitor은(는) sudoers 파일에 없습니다. 이 사건은 보고될 것입니다.",
        ];

      case "":
        return [];

      default:
        return [`command not found: ${command} ('help' 참고)`];
    }
  };

  const submit = () => {
    const raw = value;
    setValue("");
    historyIndex.current = -1;
    if (raw.trim()) history.current.push(raw);

    if (raw.trim() === "clear") {
      setLines([]);
      return;
    }

    const outputs = run(raw);
    setLines((prev) => [
      ...prev,
      { id: nextId.current++, kind: "command" as const, text: raw },
      ...outputs.map((text) => ({
        id: nextId.current++,
        kind: "output" as const,
        text,
      })),
    ]);
  };

  /** 방향키로 명령 히스토리를 오간다. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const items = history.current;
    if (event.key === "ArrowUp" && items.length > 0) {
      event.preventDefault();
      historyIndex.current =
        historyIndex.current === -1
          ? items.length - 1
          : Math.max(historyIndex.current - 1, 0);
      setValue(items[historyIndex.current]);
    }
    if (event.key === "ArrowDown" && historyIndex.current !== -1) {
      event.preventDefault();
      historyIndex.current += 1;
      if (historyIndex.current >= items.length) {
        historyIndex.current = -1;
        setValue("");
      } else {
        setValue(items[historyIndex.current]);
      }
    }
  };

  const prompt = (
    <span className="shrink-0">
      <span className="text-accent">visitor@belog</span>
      <span className="text-foreground/40">:~$</span>
    </span>
  );

  return (
    <WindowFrame
      title="terminal"
      defaultWidth={640}
      defaultHeight={440}
      {...frame}
    >
      {/* 어디를 눌러도 입력에 초점이 가는 것이 진짜 터미널의 감각이다. */}
      <div
        className="min-h-full cursor-text p-4 font-mono text-[12.5px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) =>
          line.kind === "command" ? (
            <div key={line.id} className="flex gap-2">
              {prompt}
              <span className="min-w-0 break-all text-foreground">
                {line.text}
              </span>
            </div>
          ) : (
            <div
              key={line.id}
              className="whitespace-pre-wrap break-all text-foreground/65"
            >
              {line.text}
            </div>
          ),
        )}

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {prompt}
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent text-foreground caret-accent outline-none"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="터미널 명령 입력"
          />
        </form>
        <div ref={endRef} />
      </div>
    </WindowFrame>
  );
}
