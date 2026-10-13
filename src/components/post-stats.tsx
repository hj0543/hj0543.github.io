"use client";

import { Eye, Heart, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useBrowserOrigin } from "@/lib/browser-origin";
import { giscus } from "@/lib/giscus";
import { discussionCounts, postViews, type DiscussionCounts } from "@/lib/post-stats";

export default function PostStats({
  slug,
  recordVisit = false,
  className = "",
}: {
  slug: string;
  recordVisit?: boolean;
  className?: string;
}) {
  const origin = useBrowserOrigin();
  const frame = useRef<HTMLIFrameElement>(null);
  const mainMetadataReceived = useRef(false);
  const [counts, setCounts] = useState<DiscussionCounts | null>(null);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    postViews(slug, recordVisit).then((value) => {
      if (active) setViews(value);
    }).catch(() => {
      // 조회 실패는 0으로 바꾸지 않고 미확인 상태로 표시한다.
    });
    return () => { active = false; };
  }, [slug, recordVisit]);

  useEffect(() => {
    function receiveMetadata(event: MessageEvent) {
      if (event.origin !== "https://giscus.app" || !event.source) return;
      const mainFrame = document.getElementById(`comments-${slug}`)
        ?.shadowRoot?.querySelector<HTMLIFrameElement>("iframe");
      const fromMain = Boolean(mainFrame?.contentWindow && event.source === mainFrame.contentWindow);
      if (event.source !== frame.current?.contentWindow && !fromMain) return;
      if (!fromMain && mainMetadataReceived.current) return;

      const data = event.data?.giscus;
      if (data?.discussion?.repository?.nameWithOwner === giscus.repo) {
        try {
          const next = discussionCounts(data.discussion);
          if (fromMain) mainMetadataReceived.current = true;
          setCounts(next);
        } catch {
          // 형식이 다른 메타데이터는 기존 집계를 덮어쓰지 않는다.
        }
      } else if (data?.error === "Discussion not found") {
        setCounts((current) => current ?? { comments: 0, likes: 0 });
      }
    }
    window.addEventListener("message", receiveMetadata);
    return () => window.removeEventListener("message", receiveMetadata);
  }, [slug]);

  const stats = [
    { label: "댓글", Icon: MessageCircle, value: counts?.comments },
    { label: "좋아요", Icon: Heart, value: counts?.likes },
    { label: "조회", Icon: Eye, value: views },
  ];
  const query = new URLSearchParams({
    origin,
    repo: giscus.repo,
    repoId: giscus.repoId,
    category: giscus.category,
    categoryId: giscus.categoryId,
    term: `devlog/${slug}`,
    strict: "1",
    reactionsEnabled: "0",
    emitMetadata: "1",
    inputPosition: "top",
    theme: "light",
  });

  return (
    <span className={`relative inline-flex flex-wrap items-center gap-3 text-[12px] tabular-nums text-foreground/65 ${className}`}>
      {stats.map(({ label, Icon, value }) => (
        <span key={label} className="inline-flex items-center gap-1" title={`${label} 수`}>
          <Icon aria-hidden="true" size={13} strokeWidth={1.7} />
          <span className="sr-only">{label} </span>
          <span>{value == null ? "—" : value.toLocaleString("ko-KR")}</span>
        </span>
      ))}
      {/* API는 CORS로 제한되어 있으므로 공식 위젯의 읽기 전용 메타데이터를 받는다. */}
      {origin && giscus.categoryId ? (
        <iframe
          ref={frame}
          src={`https://giscus.app/ko/widget?${query}`}
          title="게시글 통계"
          aria-hidden="true"
          tabIndex={-1}
          loading="lazy"
          className="pointer-events-none absolute left-0 top-0 h-px w-px border-0 opacity-0"
        />
      ) : null}
    </span>
  );
}
