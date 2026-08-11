import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages는 정적 파일만 서빙하므로 out/ 으로 export
  output: "export",
  // export 모드에서는 next/image 최적화 서버가 없음
  images: { unoptimized: true },
};

export default nextConfig;
