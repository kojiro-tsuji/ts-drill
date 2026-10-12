// problems/*.json をすべて読み込む（サーバー側専用）。
// ビルド時に読んで静的に埋め込むので、問題を追加したらファイルを置くだけでよい。

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Problem } from "./problem";

export function loadProblems(): Problem[] {
  const dir = join(process.cwd(), "problems");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Problem)
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
}
