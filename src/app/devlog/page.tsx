import type { Metadata } from "next";

import { NoteLink } from "@/components/devlog-doc";
import { readDevlogPosts } from "@/lib/content";

export const metadata: Metadata = { title: "기록 · Belog" };

/** 홈의 "모든 글 보기"가 여는 전체 글 목록. */
export default async function DevlogIndex() {
  const posts = await readDevlogPosts();

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <p className="section-label">Notes</p>
      <h1 className="mt-3 text-[2rem] font-bold tracking-[-0.025em] text-foreground">
        만들며 남긴 기록
      </h1>
      <ol className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
        {posts.map((post) => (
          <li key={post.slug}>
            <NoteLink post={post} />
          </li>
        ))}
      </ol>
    </div>
  );
}
