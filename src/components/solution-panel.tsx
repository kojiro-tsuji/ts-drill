import type { Problem } from "@/lib/problem";
import { CodeViewer } from "./code-editor";
import { LockIcon } from "./icons";
import { Button, Panel, PanelHeader, PanelLabel, Pill, SectionTitle } from "./ui";

type Props = {
  problem: Problem;
  shown: boolean;
  onShow: () => void;
  onHide: () => void;
};

export function SolutionPanel({ problem, shown, onShow, onHide }: Props) {
  return (
    <Panel className="flex-[1_1_360px] max-sm:h-auto">
      <PanelHeader>
        <PanelLabel>模範解答</PanelLabel>
        <Pill>{shown ? "表示中" : "非表示"}</Pill>
      </PanelHeader>

      {shown ? (
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-[18px] pt-[18px] pb-6">
          <div className="overflow-hidden rounded-[10px] border border-line bg-code">
            <CodeViewer code={problem.solution.code} />
          </div>

          <div className="flex flex-col gap-3">
            <SectionTitle>解説</SectionTitle>
            {problem.solution.explanation.map((ex) => (
              <p key={ex.lead} className="m-0 text-sm leading-[1.85] text-text-dim">
                <b className="text-text">{ex.lead}</b> {ex.body}
              </p>
            ))}
          </div>

          <Button onClick={onHide} className="self-start">
            非表示にする
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3.5 p-8 text-center">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-btn-hover">
            <LockIcon />
          </div>
          <div className="text-[17px] font-bold">模範解答は非表示です</div>
          <div className="text-sm leading-[1.8] text-muted">
            まずは自力で解いてみましょう。
            <br />
            行き詰まったら、いつでも見られます。
          </div>
          <Button onClick={onShow}>模範解答を見る</Button>
        </div>
      )}
    </Panel>
  );
}
