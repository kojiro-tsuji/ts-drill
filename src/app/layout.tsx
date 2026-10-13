import type { Metadata } from "next";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { jetbrainsMono, zenKaku } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "tsdrill",
  description: "ブラウザで TypeScript の問題を解く演習アプリ",
};

// 描画前に保存済みのテーマを反映し、ダーク → ライトのちらつきを防ぐ
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      // data-theme は描画前のスクリプトで書き換わるので、不一致の警告を出さない
      suppressHydrationWarning
      className={`${zenKaku.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
