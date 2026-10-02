"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { toggleTheme, useTheme } from "@/lib/theme";
import { profile } from "@/lib/profile";

// 상세 페이지에서도 홈의 해당 섹션으로 돌아가도록 /# 경로를 쓴다.
const NAV = [
  { label: "Projects", href: "/#projects" },
  { label: "Devlog", href: "/#devlog" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function SiteHeader() {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const next = theme === "dark" ? "라이트 테마" : "다크 테마";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="text-[17px] font-bold tracking-[-0.03em] text-foreground"
        >
          Belog<span className="text-accent">.</span>
        </Link>

        <nav aria-label="주요 메뉴" className="ml-auto hidden items-center gap-6 md:flex">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0 md:gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-foreground/60 transition-colors hover:text-accent md:block"
          >
            GitHub ↗
          </a>
          <button
            type="button"
            aria-label={next}
            title={next}
            onClick={toggleTheme}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-ink/6 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {/* 아이콘은 현재 상태를, 라벨은 누르면 바뀔 대상을 알려준다. */}
            {theme === "dark" ? (
              <Moon aria-hidden="true" size={16} strokeWidth={1.8} />
            ) : (
              <Sun aria-hidden="true" size={16} strokeWidth={1.8} />
            )}
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground/75 hover:bg-ink/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          >
            {menuOpen ? <X aria-hidden="true" size={19} /> : <Menu aria-hidden="true" size={19} />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="모바일 주요 메뉴"
        className={`${menuOpen ? "block" : "hidden"} absolute inset-x-0 top-full border-y border-ink/10 bg-background px-5 py-3 shadow-lg md:hidden`}
      >
        <div className="mx-auto grid max-w-[1080px]">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center border-b border-ink/8 text-sm font-medium text-foreground/80 last:border-0 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {label}
            </Link>
          ))}
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex min-h-11 items-center text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            GitHub ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
