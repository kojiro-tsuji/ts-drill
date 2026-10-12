// 変換済みの JS（CommonJS 形式）を実行し、標準出力を集める。
// ブラウザの Worker と Node のスクリプトの両方から使うため、DOM にも Node にも依存しない。

export type ExecOutcome =
  | { kind: "ok"; stdout: string; stderr: string; timeMs: number }
  | { kind: "error"; stdout: string; stderr: string; timeMs: number; message: string };

// process.exit() で処理を打ち切るための目印
class ExitSignal {
  constructor(readonly code: number) {}
}

export function executeJs(js: string, stdin: string): ExecOutcome {
  let stdout = "";
  let stderr = "";

  // fs の模擬。readFileSync(0) と "/dev/stdin" だけを標準入力として扱う
  const fs = {
    readFileSync(path: unknown) {
      if (path === 0 || path === "/dev/stdin") return stdin;
      throw new Error(`ENOENT: ファイルは読めません: ${String(path)}`);
    },
  };

  const require = (name: string) => {
    if (name === "fs" || name === "node:fs") return fs;
    throw new Error(`モジュール "${name}" はこの環境では使えません`);
  };

  const console = {
    log: (...args: unknown[]) => (stdout += formatArgs(args) + "\n"),
    info: (...args: unknown[]) => (stdout += formatArgs(args) + "\n"),
    debug: (...args: unknown[]) => (stdout += formatArgs(args) + "\n"),
    error: (...args: unknown[]) => (stderr += formatArgs(args) + "\n"),
    warn: (...args: unknown[]) => (stderr += formatArgs(args) + "\n"),
  };

  const process = {
    argv: [] as string[],
    env: {} as Record<string, string>,
    stdout: { write: (s: unknown) => ((stdout += String(s)), true) },
    stderr: { write: (s: unknown) => ((stderr += String(s)), true) },
    exit: (code = 0) => {
      throw new ExitSignal(code);
    },
  };

  const cjsModule = { exports: {} as Record<string, unknown> };
  const start = performance.now();
  try {
    const fn = new Function("require", "module", "exports", "console", "process", js);
    fn(require, cjsModule, cjsModule.exports, console, process);
  } catch (e) {
    const timeMs = performance.now() - start;
    if (e instanceof ExitSignal && e.code === 0) return { kind: "ok", stdout, stderr, timeMs };
    const message =
      e instanceof ExitSignal
        ? `process.exit(${e.code}) で終了しました`
        : e instanceof Error
          ? `${e.name}: ${e.message}`
          : `例外: ${String(e)}`;
    return { kind: "error", stdout, stderr, timeMs, message };
  }
  return { kind: "ok", stdout, stderr, timeMs: performance.now() - start };
}

// console.log の引数を、Node の表示に近い形で文字列にする
function formatArgs(args: unknown[]): string {
  return args.map((a) => (typeof a === "string" ? a : inspect(a, 0))).join(" ");
}

function inspect(v: unknown, depth: number): string {
  if (typeof v === "string") return depth === 0 ? v : `'${v}'`;
  if (typeof v === "bigint") return `${v}n`;
  if (typeof v === "function") return `[Function: ${v.name || "(anonymous)"}]`;
  if (v === null || typeof v !== "object") return String(v);
  if (depth > 2) return Array.isArray(v) ? "[Array]" : "[Object]";
  if (Array.isArray(v)) {
    return v.length === 0 ? "[]" : `[ ${v.map((x) => inspect(x, depth + 1)).join(", ")} ]`;
  }
  if (v instanceof Map) {
    const items = [...v].map(([k, x]) => `${inspect(k, depth + 1)} => ${inspect(x, depth + 1)}`);
    return `Map(${v.size}) {${items.length ? ` ${items.join(", ")} ` : ""}}`;
  }
  if (v instanceof Set) {
    const items = [...v].map((x) => inspect(x, depth + 1));
    return `Set(${v.size}) {${items.length ? ` ${items.join(", ")} ` : ""}}`;
  }
  const entries = Object.entries(v).map(([k, x]) => `${k}: ${inspect(x, depth + 1)}`);
  return entries.length === 0 ? "{}" : `{ ${entries.join(", ")} }`;
}
