export type DiscussionCounts = { comments: number; likes: number };

function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid post count");
  }
  return value;
}

/** 댓글의 반응은 제외하고 게시글의 HEART만 좋아요로 집계한다. */
export function discussionCounts(value: unknown): DiscussionCounts {
  const discussion = value as {
    totalCommentCount: unknown;
    totalReplyCount: unknown;
    reactions: { HEART?: { count: unknown } };
  };
  return {
    comments: count(discussion.totalCommentCount) + count(discussion.totalReplyCount),
    likes: count(discussion.reactions.HEART?.count ?? 0),
  };
}

const pendingVisits = new Map<string, Promise<number>>();
const visited = new Set<string>();

async function requestViews(slug: string, increment: boolean): Promise<number> {
  const key = encodeURIComponent(`devlog-${slug}`);
  const response = await fetch(
    `https://abacus.jasoncameron.dev/${increment ? "hit" : "get"}/hj0543.github.io/${key}`,
    { cache: "no-store", signal: AbortSignal.timeout(10000) },
  );
  if (!increment && response.status === 404) return 0;
  if (!response.ok) throw new Error(`View counter: ${response.status}`);
  return count((await response.json()).value);
}

/** 목록은 읽기만 하고, 배포 사이트의 상세 페이지는 같은 탭에서 한 번만 집계한다. */
export function postViews(slug: string, recordVisit = false): Promise<number> {
  const pending = pendingVisits.get(slug);
  if (pending) return pending;

  const key = `belog:view:${slug}`;
  let alreadyVisited = visited.has(slug);
  try {
    alreadyVisited ||= sessionStorage.getItem(key) === "1";
  } catch {
    // 저장이 막힌 환경에서는 이 탭의 메모리로 중복 집계를 막는다.
  }
  if (!recordVisit || window.location.hostname !== "hj0543.github.io" || alreadyVisited) {
    return requestViews(slug, false);
  }

  const visit = requestViews(slug, true)
    .then((views) => {
      visited.add(slug);
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // 메모리에 기록한 방문 정보는 유지한다.
      }
      return views;
    })
    .finally(() => pendingVisits.delete(slug));
  pendingVisits.set(slug, visit);
  return visit;
}
