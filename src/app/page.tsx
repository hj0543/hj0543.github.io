import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

import HomeScene from "@/components/home-scene";
import type { DevlogPost } from "@/components/sections/devlog-section";

const DEVLOG_DIR = path.join(process.cwd(), "content/devlog");

/** 글 이미지를 두는 곳. public/ 아래 이 경로에 글 이름으로 폴더를 만든다. */
const IMAGE_BASE = "/devlog/images";

/** YAML은 date를 Date로 파싱하므로 둘 다 받아 YYYY-MM-DD로 맞춘다. */
function toDateString(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

/**
 * 글 폴더를 기준으로 한 상대 경로를 실제 URL로 채운다.
 * ![](hero.png) → /devlog/images/2026-08-12-window-stack/hero.png
 * /로 시작하거나 http·data로 시작하는 주소는 그대로 둔다.
 */
function resolveImagePaths(html: string, slug: string) {
  return html.replace(
    /(<img[^>]+src=")(?!https?:|\/|data:)([^"]+)(")/g,
    `$1${IMAGE_BASE}/${slug}/$2$3`,
  );
}

// 정적 배포라 글은 빌드 시점에 한 번만 읽는다.
async function readDevlogPosts(): Promise<DevlogPost[]> {
  const files = (await fs.readdir(DEVLOG_DIR)).filter((name) =>
    name.endsWith(".md"),
  );

  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(DEVLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");

      return {
        slug,
        title: String(data.title ?? file),
        date: toDateString(data.date),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        summary: String(data.summary ?? ""),
        html: resolveImagePaths(await marked.parse(content), slug),
      };
    }),
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export default async function Home() {
  return <HomeScene posts={await readDevlogPosts()} />;
}
