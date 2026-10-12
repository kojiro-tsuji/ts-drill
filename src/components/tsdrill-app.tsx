"use client";

import { useEffect, useRef, useState } from "react";
import { problems } from "@/lib/problems";
import { judge, warmUpCompiler } from "@/lib/runner/judge";
import { EditorPanel, type RunState } from "./editor-panel";
import { Header } from "./header";
import { ProblemPanel } from "./problem-panel";
import { SolutionPanel } from "./solution-panel";

function randomIndex(exclude?: number): number {
  const candidates = problems.map((_, i) => i).filter((i) => i !== exclude);
  if (candidates.length === 0) return exclude ?? 0;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function TsdrillApp() {
  const [index, setIndex] = useState(() => randomIndex());
  const problem = problems[index];
  const [code, setCode] = useState(problem.starterCode);
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [hasRun, setHasRun] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  // 実行中に問題を切り替えたとき、古い結果で画面を上書きしないための番号
  const runId = useRef(0);

  useEffect(() => warmUpCompiler(), []);

  const nextProblem = () => {
    const next = randomIndex(index);
    runId.current++;
    setIndex(next);
    setCode(problems[next].starterCode);
    setRun({ kind: "idle" });
    setHasRun(false);
    setAnswerShown(false);
  };

  const execute = async () => {
    const id = ++runId.current;
    setHasRun(true);
    setRun({ kind: "running", verdicts: [] });
    const result = await judge(code, problem.samples, problem.timeLimitMs, (i, verdict) => {
      if (id !== runId.current) return;
      setRun((prev) => {
        if (prev.kind !== "running") return prev;
        const verdicts = [...prev.verdicts];
        verdicts[i] = verdict;
        return { kind: "running", verdicts };
      });
    });
    if (id === runId.current) setRun({ kind: "done", result });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-page text-text">
      <Header onNext={nextProblem} />
      <main className="flex flex-1 flex-wrap gap-3 p-3">
        <ProblemPanel problem={problem} />
        <EditorPanel
          problem={problem}
          code={code}
          onCodeChange={setCode}
          run={run}
          hasRun={hasRun}
          onRun={execute}
        />
        <SolutionPanel
          problem={problem}
          shown={answerShown}
          onShow={() => setAnswerShown(true)}
          onHide={() => setAnswerShown(false)}
        />
      </main>
    </div>
  );
}
