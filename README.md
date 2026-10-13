# hj0543.github.io

## 게시글 댓글과 반응

개발 기록 상세 페이지에 공식 `@giscus/react` 위젯을 사용합니다. 댓글과 반응은
GitHub Discussions에 저장되며, 작성하려면 방문자의 GitHub 로그인이 필요합니다.
사이트의 라이트·다크 테마를 따르고, `devlog/글-slug`를 기준으로 글별 토론을 분리합니다.

처음 연결할 때 한 번 설정합니다.

1. [저장소 설정](https://github.com/hj0543/hj0543.github.io/settings)의 Features에서 Discussions를 켭니다.
2. [giscus 앱](https://github.com/apps/giscus)을 `hj0543.github.io` 저장소에 설치합니다.
3. [giscus 설정](https://giscus.app/ko)에 `hj0543/hj0543.github.io`를 입력하고
   Announcements 카테고리를 선택합니다.
4. 생성된 스크립트의 `data-category-id` 값을 `src/lib/giscus.ts`의 `categoryId`에 넣습니다.
5. 로컬에서 확인한 뒤 배포합니다. 추가 환경 변수나 비밀 키는 필요하지 않습니다.

`categoryId`를 비워 두면 댓글 영역을 표시하지 않습니다. 기존 댓글은 GitHub에 남습니다.

## 게시글 통계

홈과 전체 글 목록, 글 상세에 댓글·하트 좋아요·조회 수를 표시합니다.
댓글 수에는 답글을 포함하고, 좋아요 수는 게시글의 HEART만 집계합니다.
공식 giscus 위젯의 읽기 전용 메타데이터를 사용하며 토큰을 노출하지 않습니다.
글 상세에서 댓글이나 좋아요가 바뀌면 해당 페이지의 숫자도 갱신됩니다.

조회 수는 [Abacus](https://v2.jasoncameron.dev/abacus)의 공개 카운터에 저장합니다.
`hj0543.github.io`의 글 상세를 방문할 때 같은 탭에서 글마다 한 번 증가합니다.
목록과 로컬 미리보기는 값을 읽기만 하며, 과거 조회 수는 소급 집계하지 않습니다.
간단한 공개 카운터이므로 정확한 순방문자 분석이나 조작 방지 기능은 없습니다.
API 조회가 실패하면 숫자 대신 `—`를 표시합니다.

하트만 표시하는 giscus 테마는 `public/giscus/`에 있습니다.
통계 집계와 중복 방문 처리는 Node.js 22 이상에서 `npm test`로 확인합니다.
