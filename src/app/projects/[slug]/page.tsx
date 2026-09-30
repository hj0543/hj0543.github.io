import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDoc } from "@/components/project-doc";
import { readProjects } from "@/lib/content";

// 정적 배포라 빌드 때 만든 프로젝트 말고는 존재하지 않는다.
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await readProjects();
  return projects.map(({ slug }) => ({ slug }));
}

async function findProject(slug: string) {
  const projects = await readProjects();
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await findProject((await params).slug);
  return project
    ? {
        title: `${project.name} · Belog`,
        description: project.tagline || undefined,
      }
    : {};
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const project = await findProject((await params).slug);
  if (!project) notFound();

  return (
    // 본문 스타일이 화면 폭 대신 이 영역 폭을 기준으로 반응하도록 컨테이너로 둔다.
    <div className="@container">
      <ProjectDoc project={project} />
    </div>
  );
}
