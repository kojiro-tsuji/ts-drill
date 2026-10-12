import { JetBrains_Mono, Zen_Kaku_Gothic_New } from "next/font/google";

export const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  // 日本語の字形は subsets で指定できないため、先読みはしない
  preload: false,
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
