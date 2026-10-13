"use client";

import { useState } from "react";
import type { Problem } from "@/lib/problem";
import { normalizeOutput } from "@/lib/runner/compare";
import type { JudgeResult, SampleVerdict } from "@/lib/runner/judge";
import type { Theme } from "@/lib/theme";
import { CodeEditor } from "./code-editor";
import { PlayIcon, TsFileIcon } from "./icons";
import { Button, Panel, PanelHeader, PanelLabel, Pill, type Tone } from "./ui";

export type RunState =
  | { kind: "idle" }
  | { kind: "running"; verdicts: (SampleVerdict | undefined)[] }
  | { kind: "done"; result: JudgeResult };

type Props = {
  problem: Problem;
  code: string;
  onCodeChange: (code: string) => void;
  run: RunState;
  hasRun: boolean;
  onRun: () => void;
  theme: Theme;
};

export function EditorPanel({ problem, code, onCodeChange, run, hasRun, onRun, theme }: Props) {
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const summary = summarize(run, problem.samples.length);

  return (
    <Panel className="max-lg:h-[680px]">
      <PanelHeader className="pr-2.5">
        <div className="flex items-center gap-2.5 font-mono text-[13px]">
          <TsFileIcon />
          solution.ts
        </div>
        <Button variant="primary" onClick={onRun} disabled={run.kind === "running"}>
          <PlayIcon />
          <span>{hasRun ? "再実行" : "実行"}</span>
        </Button>
      </PanelHeader>

      <div className="min-h-0 flex-1 bg-code">
        <CodeEditor
          value={code}
          theme={theme}
          onChange={onCodeChange}
          onCursorChange={(line, column) => setCursor({ line, column })}
        />
      </div>

      <div className="flex h-8 flex-none items-center justify-between gap-3 border-t border-line bg-statusbar px-4 font-mono text-xs whitespace-nowrap text-muted">
        <span className="truncate">TypeScript · UTF-8 · LF</span>
        <span className="truncate">
          自動補完: 括弧 ON · Ln {cursor.line}, Col {cursor.column}
        </span>
      </div>

      <div className="max-h-[45%] flex-none overflow-auto bg-panel">
        <div className="flex h-12 items-center justify-between gap-3 border-t border-line px-4">
          <PanelLabel>テスト結果</PanelLabel>
          <Pill tone={summary.tone}>{summary.label}</Pill>
        </div>

        {run.kind === "done" && run.result.kind === "compile-error" && (
          <div className="border-t border-line px-4 py-2.5 font-mono text-[13px] leading-[1.7] whitespace-pre-wrap text-error">
            {run.result.errors.map((e) => `${e.line} 行 ${e.column} 列: ${e.message}`).join("\n")}
          </div>
        )}

        {problem.samples.map((sample, i) => (
          <ResultRow key={i} index={i} expected={sample.output} verdict={verdictAt(run, i)} />
        ))}
      </div>
    </Panel>
  );
}

function verdictAt(run: RunState, i: number): SampleVerdict | undefined {
  if (run.kind === "running") return run.verdicts[i];
  if (run.kind === "done" && run.result.kind === "judged") return run.result.verdicts[i];
  return undefined;
}

function summarize(run: RunState, total: number): { label: string; tone: Tone } {
  if (run.kind === "idle") return { label: "未実行", tone: "idle" };
  if (run.kind === "running") return { label: "実行中…", tone: "idle" };
  if (run.result.kind === "compile-error") return { label: "構文エラー", tone: "error" };
  const ac = run.result.verdicts.filter((v) => v.status === "AC").length;
  return { label: `${ac} / ${total} サンプル正解`, tone: ac === total ? "ok" : "error" };
}

const badgeLabel: Record<SampleVerdict["status"], string> = {
  AC: "正解",
  WA: "不正解",
  RE: "エラー",
  TLE: "時間切れ",
};

function formatTime(ms: number): string {
  return ms < 1 ? "< 1 ms" : `${Math.round(ms)} ms`;
}

function ResultRow({ index, expected, verdict }: { index: number; expected: string; verdict?: SampleVerdict }) {
  const badgeClass = !verdict
    ? "bg-badge-idle text-muted"
    : verdict.status === "AC"
      ? "bg-accent text-on-accent"
      : "bg-error text-on-error";

  const actual = verdict && verdict.status !== "TLE" ? normalizeOutput(verdict.actual) || "（なし）" : "—";
  const time = !verdict ? "—" : verdict.status === "TLE" ? `> ${verdict.timeLimitMs} ms` : formatTime(verdict.timeMs);
  const message =
    verdict?.status === "RE"
      ? verdict.message
      : verdict?.status === "TLE"
        ? `制限時間（${verdict.timeLimitMs / 1000} 秒）を超えたため打ち切りました`
        : null;

  return (
    <div className="border-t border-line px-4 py-2.5 text-[13px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className={`inline-flex h-6 min-w-12 items-center justify-center rounded-md px-2 text-xs font-bold ${badgeClass}`}>
          {verdict ? badgeLabel[verdict.status] : "—"}
        </span>
        <span className="flex-[1_1_90px] font-medium">サンプル {index + 1}</span>
        <span className="font-mono text-muted">
          期待 <span className="whitespace-pre-wrap text-text">{expected}</span>
        </span>
        <span className="font-mono text-muted">
          出力{" "}
          <span className={`whitespace-pre-wrap ${verdict && verdict.status !== "AC" ? "text-error" : "text-text"}`}>
            {actual}
          </span>
        </span>
        <span className="min-w-11 text-right font-mono text-muted">{time}</span>
      </div>
      {message && <div className="mt-1.5 font-mono text-xs leading-[1.6] break-all text-error">{message}</div>}
    </div>
  );
}
