import { ArrowRightIcon, LogoMark } from "./icons";
import { Button } from "./ui";

const chip = "inline-flex h-7 items-center gap-2 rounded-full border border-chip px-3 text-xs text-muted";

export function Header({ onNext }: { onNext: () => void }) {
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
      <Button onClick={onNext}>
        <span>次の問題へ</span>
        <ArrowRightIcon />
      </Button>
    </header>
  );
}
