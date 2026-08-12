import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

/** 읽어 온 마크다운 한 편. data는 frontmatter 원본이다. */
export type MarkdownFile = {
  /** 확장자를 뗀 파일 이름. 창 제목과 이미지 폴더 이름에 그대로 쓴다. */
  slug: string;
  data: Record<string, unknown>;
  html: string;
};

/**
 * 글 폴더를 기준으로 한 상대 경로를 실제 URL로 채운다.
 * ![](hero.png) → /devlog/images/2026-08-05-hello/hero.png
 * /로 시작하거나 http·data로 시작하는 주소는 그대로 둔다.
 */
function resolveImagePaths(html: string, base: string) {
  return html.replace(
    /(<img[^>]+src=")(?!https?:|\/|data:)([^"]+)(")/g,
    `$1${base}/$2$3`,
  );
}

/** YAML은 date를 Date로 파싱하므로 둘 다 받아 YYYY-MM-DD로 맞춘다. */
export function toDateString(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

/** frontmatter에 목록이 없거나 형태가 다르면 빈 배열로 둔다. */
export function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

/**
 * content/{dir}의 마크다운을 모두 읽어 frontmatter와 변환한 본문을 돌려준다.
 * 본문 이미지는 public/{dir}/images/{슬러그}/ 를 기준으로 채운다.
 * 정적 배포라 빌드할 때 한 번만 읽는다.
 */
export async function readMarkdownDir(dir: string): Promise<MarkdownFile[]> {
  const root = path.join(process.cwd(), "content", dir);
  const files = (await fs.readdir(root)).filter((name) => name.endsWith(".md"));

  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(root, file), "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");

      return {
        slug,
        data,
        html: resolveImagePaths(
          await marked.parse(content),
          `/${dir}/images/${slug}`,
        ),
      };
    }),
  );
}
