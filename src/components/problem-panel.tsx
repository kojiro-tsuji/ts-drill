import { difficultyLabel, type Problem } from "@/lib/problem";
import { CodeBox, Panel, PanelHeader, PanelLabel, SectionTitle } from "./ui";

export function ProblemPanel({ problem }: { problem: Problem }) {
  return (
    <Panel className="flex-[1_1_380px] max-sm:h-auto">
      <PanelHeader>
        <PanelLabel>問題</PanelLabel>
        <span className="text-xs text-muted">
          {difficultyLabel(problem.difficulty)} · <span className="font-mono">{problem.timeLimitMs / 1000} sec</span>
        </span>
      </PanelHeader>
      <div className="flex flex-1 flex-col gap-[22px] overflow-auto px-[22px] pt-[22px] pb-[26px]">
        <h1 className="m-0 text-2xl leading-[1.35] font-bold">{problem.title}</h1>

        <div>
          <SectionTitle className="mb-2">問題文</SectionTitle>
          <p className="m-0 text-[15px] leading-[1.85] text-text-dim">{problem.statement}</p>
        </div>

        <div>
          <SectionTitle className="mb-2">制約</SectionTitle>
          <div className="flex flex-col gap-1 text-[15px] leading-[1.7] text-text-dim">
            {problem.constraints.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle className="mb-2">入力・出力</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="min-w-0">
              <div className="mb-1.5 text-xs text-muted">入力形式</div>
              <CodeBox wrap>{problem.inputFormat}</CodeBox>
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 text-xs text-muted">出力形式</div>
              <CodeBox wrap>{problem.outputFormat}</CodeBox>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <SectionTitle>サンプル</SectionTitle>
          {problem.samples.map((s, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="text-[13px] font-bold">入力例 {i + 1}</div>
              <div className="grid grid-cols-2 gap-2.5">
                <CodeBox>{s.input}</CodeBox>
                <CodeBox>{s.output}</CodeBox>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
