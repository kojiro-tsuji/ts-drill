import { DIFFICULTIES, type Difficulty } from "@/lib/problem";
import { ArrowRightIcon, ChevronDownIcon, LogoMark } from "./icons";
import { Button } from "./ui";

export type DifficultyFilter = Difficulty | "all";

const chip = "inline-flex h-7 items-center gap-2 rounded-full border border-chip px-3 text-xs text-muted";

type Props = {
  difficulty: DifficultyFilter;
  counts: Map<Difficulty, number>;
  total: number;
  onDifficultyChange: (filter: DifficultyFilter) => void;
  onNext: () => void;
};

export function Header({ difficulty, counts, total, onDifficultyChange, onNext }: Props) {
  return (
    <header className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-2">
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <span className="font-mono text-[17px] font-bold tracking-[-0.01em]">tsdrill</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={chip}>TypeScript</span>
        <span className={chip}>ランダム出題</span>
        <span className={chip}>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          ブラウザ内で実行
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex items-center">
          <span className="sr-only">難易度</span>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value === "all" ? "all" : (Number(e.target.value) as Difficulty))}
            className="min-h-11 cursor-pointer appearance-none rounded-[10px] border border-btn-line bg-transparent pr-10 pl-4 text-sm font-bold text-text hover:bg-btn-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all" className="bg-panel">
              難易度: すべて（{total}）
            </option>
            {DIFFICULTIES.map((d) => (
              <option key={d.level} value={d.level} disabled={!counts.get(d.level)} className="bg-panel">
                難易度: {d.label}（{counts.get(d.level) ?? 0}）
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 text-muted">
            <ChevronDownIcon />
          </span>
        </label>
        <Button onClick={onNext}>
          <span>次の問題へ</span>
          <ArrowRightIcon />
        </Button>
      </div>
    </header>
  );
}
