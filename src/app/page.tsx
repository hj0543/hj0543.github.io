import HomeScene from "@/components/home-scene";
import type { DevlogPost } from "@/components/sections/devlog-section";
import type { Project } from "@/components/sections/projects-section";
import { readMarkdownDir, toDateString, toStringArray } from "@/lib/content";

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

/** period는 "2026.08 ~ ing"처럼 정렬 키로 쓸 수 없어 frontmatter의 order를 따른다. */
async function readProjects(): Promise<Project[]> {
  const files = await readMarkdownDir("projects");

  return files
    .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0))
    .map(({ slug, data, html }) => ({
      slug,
      name: String(data.name ?? slug),
      tagline: String(data.tagline ?? ""),
      thumbnail: data.thumbnail ? String(data.thumbnail) : undefined,
      role: String(data.role ?? ""),
      period: String(data.period ?? ""),
      team: String(data.team ?? ""),
      stack: toStringArray(data.stack),
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
