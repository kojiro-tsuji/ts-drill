// 問題 JSON の検証。模範解答をアプリと同じ変換・実行の仕組みで動かし、サンプルの出力と比べる。
//   npm run verify             … 検証のみ。食い違いがあれば終了コード 1
//   npm run verify -- --write  … 模範解答の出力でサンプルの output を、入力例 1 から starterCode を書き換える
//   npm run verify -- <id>...  … 指定した問題だけを対象にする

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { executeJs } from "../src/lib/runner/execute";
import { normalizeOutput, outputsMatch } from "../src/lib/runner/compare";
import { transpile } from "../src/lib/runner/transpile";
import { DIFFICULTIES, type Problem } from "../src/lib/problem";
import { buildStarterCode, SOLUTION_HEADER } from "../src/lib/starter-code";

const dir = join(import.meta.dirname, "..", "problems");
const args = process.argv.slice(2);
const write = args.includes("--write");
const only = new Set(args.filter((a) => !a.startsWith("--")));

// 型だけでは守れない、中身の形を確かめる
function checkShape(p: Problem, file: string): string[] {
  const errors: string[] = [];
  const nonEmpty = (v: unknown) => typeof v === "string" && v.trim() !== "";
  if (`${p.id}.json` !== file) errors.push(`id "${p.id}" がファイル名と一致しない`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id ?? "")) errors.push("id は英小文字・数字・ハイフンのみ");
  for (const key of ["title", "statement", "inputFormat", "outputFormat"] as const) {
    if (!nonEmpty(p[key])) errors.push(`${key} が空`);
  }
  if (!DIFFICULTIES.some((d) => d.level === p.difficulty)) errors.push(`difficulty が不正: ${p.difficulty}`);
  if (!Array.isArray(p.constraints) || p.constraints.length === 0) errors.push("constraints が空");
  if (typeof p.timeLimitMs !== "number" || p.timeLimitMs <= 0) errors.push("timeLimitMs が不正");
  if (!Array.isArray(p.samples) || p.samples.length === 0) errors.push("samples が空");
  else if (p.samples.some((s) => !nonEmpty(s.input))) errors.push("入力が空のサンプルがある");
  if (!Array.isArray(p.hiddenTests)) errors.push("hiddenTests が配列でない");
  if (p.samples?.length > 0 && p.starterCode !== buildStarterCode(p.samples[0].input)) {
    errors.push("starterCode が入力例 1 から作る雛形と違う（--write で書き直せる）");
  } else if (!transpile(p.starterCode).ok) {
    errors.push("starterCode に構文エラーがある");
  }
  if (!nonEmpty(p.solution?.code)) {
    errors.push("solution.code が空");
  } else {
    // 模範解答は雛形と同じ読み方で始め、入力は 1 回だけ読む（本物の Node では 2 回目は空になる）
    if (!p.solution.code.startsWith(SOLUTION_HEADER)) errors.push("模範解答の先頭が雛形と同じ入力の読み方になっていない");
    if (p.solution.code.split("readFileSync").length - 1 !== 1) errors.push("模範解答が readFileSync を 2 回以上呼んでいる");
  }
  if (!Array.isArray(p.solution?.explanation) || p.solution.explanation.length === 0) {
    errors.push("solution.explanation が空");
  } else if (p.solution.explanation.some((e) => !nonEmpty(e.lead) || !nonEmpty(e.body))) {
    errors.push("lead か body が空の解説がある");
  }
  return errors;
}

let failed = false;
const ids = new Map<string, string>();
const titles = new Map<string, string>();
const counts = new Map<number, number>();

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const path = join(dir, file);
  const problem: Problem = JSON.parse(readFileSync(path, "utf8"));
  counts.set(problem.difficulty, (counts.get(problem.difficulty) ?? 0) + 1);
  if (titles.has(problem.title)) {
    failed = true;
    console.log(`NG ${file}\n   - タイトルが ${titles.get(problem.title)} と重複`);
  }
  titles.set(problem.title, file);
  ids.set(problem.id, file);
  if (only.size > 0 && !only.has(problem.id)) continue;

  if (write && problem.samples?.length > 0) problem.starterCode = buildStarterCode(problem.samples[0].input);
  const errors = checkShape(problem, file);
  const compiled = transpile(problem.solution?.code ?? "");
  if (!compiled.ok) {
    errors.push(...compiled.errors.map((e) => `模範解答の構文エラー ${e.line}:${e.column} ${e.message}`));
  } else {
    (problem.samples ?? []).forEach((sample, i) => {
      const r = executeJs(compiled.js, sample.input);
      if (r.kind === "error") {
        errors.push(`サンプル ${i + 1}: 実行時エラー ${r.message}`);
      } else if (r.timeMs > problem.timeLimitMs) {
        errors.push(`サンプル ${i + 1}: 時間切れ (${r.timeMs.toFixed(0)} ms)`);
      } else if (normalizeOutput(r.stdout) === "") {
        errors.push(`サンプル ${i + 1}: 模範解答の出力が空`);
      } else if (write) {
        sample.output = normalizeOutput(r.stdout);
      } else if (!outputsMatch(r.stdout, sample.output)) {
        errors.push(
          `サンプル ${i + 1}: 期待 ${JSON.stringify(sample.output)} / 模範解答 ${JSON.stringify(normalizeOutput(r.stdout))}`,
        );
      }
    });
  }

  if (errors.length > 0) {
    failed = true;
    console.log(`NG ${file}`);
    for (const e of errors) console.log(`   - ${e}`);
    continue;
  }
  if (write) writeFileSync(path, JSON.stringify(problem, null, 2) + "\n");
  console.log(`OK ${file}${write ? "（出力を書き込み）" : ""}`);
}

const summary = DIFFICULTIES.map((d) => `${d.label} ${counts.get(d.level) ?? 0}`).join(" / ");
console.log(`\n全 ${ids.size} 問（${summary}）`);
process.exit(failed ? 1 : 0);
