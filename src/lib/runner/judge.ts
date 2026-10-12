// ブラウザ側の判定。変換は常駐 Worker、実行はサンプルごとの Worker で行う。

import { outputsMatch } from "./compare";
import type { ExecOutcome } from "./execute";
import type { CompileResult, CompileError } from "./transpile";

export type Sample = { input: string; output: string };

export type SampleVerdict =
  | { status: "AC" | "WA"; expected: string; actual: string; timeMs: number; stderr: string }
  | { status: "RE"; expected: string; actual: string; timeMs: number; stderr: string; message: string }
  | { status: "TLE"; expected: string; timeLimitMs: number };

export type JudgeResult =
  | { kind: "compile-error"; errors: CompileError[] }
  | { kind: "judged"; verdicts: SampleVerdict[] };

let compileWorker: Worker | null = null;
let nextId = 0;

function getCompileWorker(): Worker {
  compileWorker ??= new Worker(new URL("./compile.worker.ts", import.meta.url));
  return compileWorker;
}

// 初回の変換が遅くならないよう、画面表示時に呼んで先に読み込んでおく
export function warmUpCompiler(): void {
  getCompileWorker();
}

export function compile(code: string): Promise<CompileResult> {
  const worker = getCompileWorker();
  const id = nextId++;
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent<{ id: number; result: CompileResult }>) => {
      if (e.data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      resolve(e.data.result);
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, code });
  });
}

type RunOutcome = ExecOutcome | { kind: "timeout" };

function runOnce(js: string, stdin: string, timeLimitMs: number): Promise<RunOutcome> {
  const worker = new Worker(new URL("./exec.worker.ts", import.meta.url));
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (outcome: RunOutcome) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(outcome);
    };
    worker.onmessage = (e: MessageEvent<"ready" | ExecOutcome>) => {
      if (e.data === "ready") {
        timer = setTimeout(() => finish({ kind: "timeout" }), timeLimitMs);
        worker.postMessage({ js, stdin });
        return;
      }
      finish(e.data);
    };
    // 非同期処理の中で投げられた例外など、executeJs で捕まえられなかったもの
    worker.onerror = (e) => {
      e.preventDefault();
      finish({ kind: "error", stdout: "", stderr: "", timeMs: 0, message: e.message || "実行時エラー" });
    };
  });
}

export async function judge(
  code: string,
  samples: Sample[],
  timeLimitMs: number,
  onVerdict?: (index: number, verdict: SampleVerdict) => void,
): Promise<JudgeResult> {
  const compiled = await compile(code);
  if (!compiled.ok) return { kind: "compile-error", errors: compiled.errors };

  const verdicts: SampleVerdict[] = [];
  for (const [i, sample] of samples.entries()) {
    const outcome = await runOnce(compiled.js, sample.input, timeLimitMs);
    const verdict = toVerdict(outcome, sample.output, timeLimitMs);
    verdicts.push(verdict);
    onVerdict?.(i, verdict);
  }
  return { kind: "judged", verdicts };
}

function toVerdict(outcome: RunOutcome, expected: string, timeLimitMs: number): SampleVerdict {
  if (outcome.kind === "timeout" || outcome.timeMs > timeLimitMs) {
    return { status: "TLE", expected, timeLimitMs };
  }
  const base = { expected, actual: outcome.stdout, timeMs: outcome.timeMs, stderr: outcome.stderr };
  if (outcome.kind === "error") return { ...base, status: "RE", message: outcome.message };
  return { ...base, status: outputsMatch(outcome.stdout, expected) ? "AC" : "WA" };
}
