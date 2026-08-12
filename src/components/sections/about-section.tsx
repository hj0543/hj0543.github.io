"use client";

import { Code, Mail, MapPin } from "lucide-react";
import { motion, type Variants } from "motion/react";

import WindowFrame from "@/components/ui/window-frame";

// 카드 전체가 순서대로 나타나도록 자식 요소의 등장 시점을 늦춘다.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// 기술스택
const skills = [
  "Python",
  "Django",
  "Vue",
  "javascript",
  "React",
  "Tailwind CSS",
  "java",
];

const links = [
  { icon: Code, label: "GitHub", href: "https://github.com/hj0543" },
  { icon: Mail, label: "Email", href: "mailto:hj0543@gmail.com" },
];

export default function AboutSection(frame: {
  onClose?: () => void;
  z?: number;
  onFocus?: () => void;
  offset?: number;
}) {
  return (
      <WindowFrame
        title="about-me.tsx"
        defaultWidth={560}
        defaultHeight={480}
        {...frame}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="p-8 sm:p-9"
        >
          <motion.p
            variants={item}
            className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-accent/80"
          >
            <span className="h-px w-6 bg-accent/50" />
            About Me
          </motion.p>

          <motion.h2
            variants={item}
            className="mt-5 text-2xl font-bold leading-tight tracking-tight text-foreground"
          >
            Hello,
            <br />
            A developer who love to work with.
            <span className="bg-linear-to-r from-accent to-accent-deep bg-clip-text text-transparent">
            <br></br>Hyeonjin Jeong
            </span>{" "}

          </motion.h2>

          <motion.p
            variants={item}
            className="mt-5 text-sm leading-relaxed text-foreground/65"
          >
          - SSAFY 15th : 2026. 01 ~ 2026. 12
          <br></br>- Math Academy : 2021. 07 ~ 2025.12 (Team Leader)
          <br></br>- ROK Army : 2019. 03 ~ 2021.06 (Officer)
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 font-mono text-[11px] text-fuchsia-50/75"
              >
                {skill}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 pt-6"
          >
            <span className="flex items-center gap-1.5 text-xs text-foreground/45">
              <MapPin aria-hidden="true" size={14} strokeWidth={1.7} />
              Gumi, KR
            </span>

            {links.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center gap-1.5 text-xs text-foreground/60 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
              >
                <Icon aria-hidden="true" size={14} strokeWidth={1.7} />
                {label}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </WindowFrame>
  );
}
