import HomeScene from "@/components/home-scene";
import type { DevlogPost } from "@/components/sections/devlog-section";
import type { Project } from "@/components/sections/projects-section";
import {
  readMarkdownDir,
  toDateString,
  toImageArray,
  toLinkArray,
  toStringArray,
} from "@/lib/content";

/** 최신 글이 위로 온다. */
async function readDevlogPosts(): Promise<DevlogPost[]> {
  const files = await readMarkdownDir("devlog");

  return files
    .map(({ slug, data, html }) => ({
      slug,
      title: String(data.title ?? slug),
      date: toDateString(data.date),
      tags: toStringArray(data.tags),
      summary: String(data.summary ?? ""),
      html,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** period는 "2026.08 ~ ing"처럼 정렬 키로 쓸 수 없어 frontmatter의 order를 따른다.
 *  대표(featured) 프로젝트는 order와 무관하게 맨 앞에 온다. */
async function readProjects(): Promise<Project[]> {
  const files = await readMarkdownDir("projects");

  return files
    .sort(
      (a, b) =>
        Number(b.data.featured === true) - Number(a.data.featured === true) ||
        Number(a.data.order ?? 0) - Number(b.data.order ?? 0),
    )
    .map(({ slug, data, html }) => ({
      slug,
      name: String(data.name ?? slug),
      tagline: String(data.tagline ?? ""),
      thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
      role: String(data.role ?? ""),
      period: String(data.period ?? ""),
      team: String(data.team ?? ""),
      stack: toStringArray(data.stack),
      responsibilities: toStringArray(data.responsibilities),
      contribution:
        data.contribution === undefined ||
        !Number.isFinite(Number(data.contribution))
          ? undefined
          : Math.min(100, Math.max(0, Number(data.contribution))),
      screens: toImageArray(data.screens),
      links: toLinkArray(data.links),
      featured: data.featured === true,
      html,
    }));
}

export default async function Home() {
  const [posts, projects] = await Promise.all([
    readDevlogPosts(),
    readProjects(),
  ]);

  return <HomeScene posts={posts} projects={projects} />;
}
