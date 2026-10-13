import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // サーバー処理がないので静的ファイル（out/）として書き出し、Cloudflare にそのまま置く。
  // cacheComponents と partialPrefetching は PPR を伴い、静的書き出しと両立しないので使わない
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
