"use client";

import { useEffect, useRef, useState } from "react";
import type { Problem } from "@/lib/problem";
import {
  countByDifficulty,
  matchesDifficulty,
  pickRandomProblem,
  type DifficultyFilter,
} from "@/lib/problem-picker";
import { judge, warmUpCompiler, type RunState } from "@/lib/runner/judge";
import { useTheme } from "@/lib/use-theme";
import { EditorPanel } from "./editor-panel";
import { Header } from "./header";
import { ProblemPanel } from "./problem-panel";
import { ResizableColumns } from "./resizable-columns";
import { SolutionPanel } from "./solution-panel";

export default function TsdrillApp({ problems }: { problems: Problem[] }) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [problem, setProblem] = useState(() => pickRandomProblem(problems));
  const [code, setCode] = useState(problem.starterCode);
  const [run, setRun] = useState<RunState>({ kind: "idle" });
  const [hasRun, setHasRun] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [theme, toggleTheme] = useTheme();
  // 実行中に問題を切り替えたとき、古い結果で画面を上書きしないための番号
  const runId = useRef(0);

  useEffect(() => warmUpCompiler(), []);

  const showProblem = (next: Problem) => {
    runId.current++;
    setProblem(next);
    setCode(next.starterCode);
    setRun({ kind: "idle" });
    setHasRun(false);
    setAnswerShown(false);
  };

  const nextProblem = () => {
    showProblem(pickRandomProblem(problems.filter((p) => matchesDifficulty(p, difficulty)), problem));
  };

  // 難易度を変えたとき、今の問題が条件に合わなければ合う問題に切り替える
  const changeDifficulty = (filter: DifficultyFilter) => {
    setDifficulty(filter);
    if (!matchesDifficulty(problem, filter)) {
      showProblem(pickRandomProblem(problems.filter((p) => matchesDifficulty(p, filter))));
    }
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

  const counts = countByDifficulty(problems);

  return (
    // 横並び（lg 以上）では画面の高さちょうどに収め、下に余白を残さない
    <div className="flex min-h-dvh flex-col bg-page text-text lg:h-dvh lg:min-h-[640px]">
      <Header
        difficulty={difficulty}
        counts={counts}
        total={problems.length}
        onDifficultyChange={changeDifficulty}
        onNext={nextProblem}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex min-h-0 flex-1 flex-col p-3">
        <ResizableColumns>
          <ProblemPanel problem={problem} />
          <EditorPanel
            problem={problem}
            code={code}
            onCodeChange={setCode}
            run={run}
            hasRun={hasRun}
            onRun={execute}
            theme={theme}
          />
          <SolutionPanel
            problem={problem}
            shown={answerShown}
            onShow={() => setAnswerShown(true)}
            onHide={() => setAnswerShown(false)}
            theme={theme}
          />
        </ResizableColumns>
      </main>
    </div>
  );
}
