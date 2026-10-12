import type { Metadata } from "next";
import { jetbrainsMono, zenKaku } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "tsdrill",
  description: "ブラウザで TypeScript の問題を解く演習アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${zenKaku.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
