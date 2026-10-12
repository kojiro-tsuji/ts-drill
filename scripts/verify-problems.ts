// 問題 JSON の検証。模範解答をアプリと同じ変換・実行の仕組みで動かし、サンプルの出力と比べる。
//   npm run verify          … 検証のみ。食い違いがあれば終了コード 1
//   npm run verify -- --write … 模範解答の出力でサンプルの output を書き換える

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { executeJs } from "../src/lib/runner/execute";
import { normalizeOutput, outputsMatch } from "../src/lib/runner/compare";
import { transpile } from "../src/lib/runner/transpile";
import type { Problem } from "../src/lib/problem";

const dir = join(import.meta.dirname, "..", "problems");
const write = process.argv.includes("--write");
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const path = join(dir, file);
  const problem: Problem = JSON.parse(readFileSync(path, "utf8"));
  const problems: string[] = [];

  if (`${problem.id}.json` !== file) problems.push(`id "${problem.id}" がファイル名と一致しない`);

  const compiled = transpile(problem.solution.code);
  if (!compiled.ok) {
    problems.push(...compiled.errors.map((e) => `模範解答の構文エラー ${e.line}:${e.column} ${e.message}`));
  } else {
    problem.samples.forEach((sample, i) => {
      const r = executeJs(compiled.js, sample.input);
      if (r.kind === "error") {
        problems.push(`サンプル ${i + 1}: 実行時エラー ${r.message}`);
      } else if (r.timeMs > problem.timeLimitMs) {
        problems.push(`サンプル ${i + 1}: 時間切れ (${r.timeMs.toFixed(0)} ms)`);
      } else if (write) {
        sample.output = normalizeOutput(r.stdout);
      } else if (!outputsMatch(r.stdout, sample.output)) {
        problems.push(`サンプル ${i + 1}: 期待 ${JSON.stringify(sample.output)} / 模範解答 ${JSON.stringify(normalizeOutput(r.stdout))}`);
      }
    });
  }

  if (problems.length > 0) {
    failed = true;
    console.log(`NG ${file}`);
    for (const p of problems) console.log(`   - ${p}`);
    continue;
  }
  if (write) writeFileSync(path, JSON.stringify(problem, null, 2) + "\n");
  console.log(`OK ${file}${write ? "（出力を書き込み）" : ""}`);
}

process.exit(failed ? 1 : 0);
