"use client";

import Giscus from "@giscus/react";

import { useBrowserOrigin } from "@/lib/browser-origin";
import { giscus } from "@/lib/giscus";
import { useTheme } from "@/lib/theme";

export default function PostComments({ slug }: { slug: string }) {
  const theme = useTheme();
  const origin = useBrowserOrigin();

  // 연결 전에는 오류가 있는 위젯을 방문자에게 표시하지 않는다.
  if (!giscus.categoryId) return null;

  return (
    <section aria-label="댓글과 좋아요" className="mt-16 border-t border-ink/15 pt-8">
      <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground">댓글과 좋아요</h2>
      <p className="mt-2 text-[13px] leading-6 text-foreground/65">
        GitHub 계정으로 댓글과 하트 좋아요를 남길 수 있어요.
      </p>
      <div className="mt-6">
        <Giscus
          id={`comments-${slug}`}
          repo={giscus.repo}
          repoId={giscus.repoId}
          category={giscus.category}
          categoryId={giscus.categoryId}
          mapping="specific"
          term={`devlog/${slug}`}
          strict="1"
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="top"
          theme={origin ? `${origin}/giscus/${theme}.css` : theme}
          lang="ko"
          loading="lazy"
        />
      </div>
    </section>
  );
}
