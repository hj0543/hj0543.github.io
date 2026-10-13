import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages는 정적 파일만 서빙하므로 out/ 으로 export
  output: "export",
  // export 모드에서는 next/image 최적화 서버가 없음
  images: { unoptimized: true },
  // /devlog/slug.html 옆에 같은 이름의 폴더가 생겨 GitHub Pages가 폴더로 풀어 404를 낸다.
  // slug/index.html로 내보내 경로를 하나로 맞춘다.
  trailingSlash: true,
  // 로컬에서도 giscus iframe이 공개 테마 CSS를 읽을 수 있게 한다.
  ...(process.env.NODE_ENV === "development"
    ? {
        headers: async () => [{
          source: "/giscus/:path*",
          headers: [{ key: "Access-Control-Allow-Origin", value: "https://giscus.app" }],
        }],
      }
    : {}),
};

export default nextConfig;
