import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DevlogDoc } from "@/components/devlog-doc";
import { readDevlogPosts } from "@/lib/content";

// 정적 배포라 빌드 때 만든 글 말고는 존재하지 않는다.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await readDevlogPosts();
  return posts.map(({ slug }) => ({ slug }));
}

async function findPost(slug: string) {
  const posts = await readDevlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/devlog/[slug]">): Promise<Metadata> {
  const post = await findPost((await params).slug);
  return post
    ? { title: `${post.title} · Belog`, description: post.summary || undefined }
    : {};
}

export default async function DevlogPage({
  params,
}: PageProps<"/devlog/[slug]">) {
  const post = await findPost((await params).slug);
  if (!post) notFound();

  return (
    // 본문 스타일이 화면 폭 대신 이 영역 폭을 기준으로 반응하도록 컨테이너로 둔다.
    <div className="@container">
      <DevlogDoc post={post} />
    </div>
  );
}
