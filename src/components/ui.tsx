// パネル・ボタン・ピルなど、各パネルで共通の部品

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <section
      // 横並び（lg 以上）では画面の高さいっぱいに伸ばす。縦積みの高さは className で指定する
      className={`flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-line bg-panel lg:h-full ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`flex h-[52px] flex-none items-center justify-between gap-3 border-b border-line px-[18px] ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelLabel({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-bold tracking-[0.06em] text-muted">{children}</span>;
}

export function SectionTitle({ className = "", children }: { className?: string; children: ReactNode }) {
  return <h2 className={`m-0 text-sm font-bold text-accent-ink ${className}`}>{children}</h2>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" };

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  const look =
    variant === "primary"
      ? "border-accent bg-accent text-on-accent hover:border-accent-hover hover:bg-accent-hover"
      : "border-btn-line bg-transparent text-text hover:bg-btn-hover";
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-[18px] text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink disabled:cursor-default disabled:opacity-60 ${look} ${className}`}
      {...props}
    />
  );
}

export type Tone = "idle" | "ok" | "error";

const pillTone: Record<Tone, string> = {
  idle: "border-chip text-muted",
  ok: "border-accent-ink text-accent-ink",
  error: "border-error text-error",
};

export function Pill({ tone = "idle", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex h-[26px] items-center rounded-full border px-3 text-xs font-bold ${pillTone[tone]}`}>
      {children}
    </span>
  );
}

// wrap: 改行は保ったまま、幅が足りなければ折り返す（説明文向け）。サンプルのデータには使わない
export function CodeBox({ wrap = false, children }: { wrap?: boolean; children: ReactNode }) {
  return (
    <div
      className={`overflow-auto rounded-lg border border-line bg-code px-3 py-2.5 font-mono text-[13px] leading-[1.7] ${wrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}
    >
      {children}
    </div>
  );
}
