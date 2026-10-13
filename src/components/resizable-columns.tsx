"use client";

// 3 つのパネルを横に並べ、間の境目をドラッグして幅の比率を変えられるようにする。
// 幅 1024px 未満では縦に積み、境目は表示しない。

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

const STORAGE_KEY = "tsdrill:pane-sizes";
// 参考デザインの flex-grow（1 : 1.3 : 1）に合わせた初期比率
const DEFAULT_SIZES: [number, number, number] = [1 / 3.3, 1.3 / 3.3, 1 / 3.3];
const MIN_PANE_PX = 260;
const HANDLE_PX = 12;
const KEY_STEP = 0.02;

type Sizes = [number, number, number];

function loadSizes(): Sizes {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length === 3 && saved.every((v) => typeof v === "number" && v > 0)) {
      const total = saved[0] + saved[1] + saved[2];
      return [saved[0] / total, saved[1] / total, saved[2] / total];
    }
  } catch {
    // 読めなければ初期比率を使う
  }
  return DEFAULT_SIZES;
}

function saveSizes(sizes: Sizes): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
  } catch {
    // 保存できなくても調整自体は効く
  }
}

// 境目 handle（0 = 左、1 = 右）の左右の 2 パネルだけで比率を分け直す
function moveHandle(sizes: Sizes, handle: 0 | 1, leftShare: number, minShare: number): Sizes {
  const next: Sizes = [...sizes];
  const pair = sizes[handle] + sizes[handle + 1];
  const left = Math.min(Math.max(leftShare, minShare), pair - minShare);
  next[handle] = left;
  next[handle + 1] = pair - left;
  return next;
}

export function ResizableColumns({ children }: { children: [ReactNode, ReactNode, ReactNode] }) {
  const [sizes, setSizes] = useState<Sizes>(loadSizes);
  const [dragging, setDragging] = useState<0 | 1 | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // パネルに使える幅（境目の分を除く）と、最小幅に当たる比率
  const measure = () => {
    const width = containerRef.current?.getBoundingClientRect().width ?? 1;
    const available = Math.max(width - 2 * HANDLE_PX, 1);
    return { available, minShare: Math.min(MIN_PANE_PX / available, 1 / 3) };
  };

  const update = (next: Sizes) => {
    setSizes(next);
    saveSizes(next);
  };

  const onPointerDown = (handle: 0 | 1) => (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(handle);
  };

  const onPointerMove = (handle: 0 | 1) => (e: PointerEvent<HTMLDivElement>) => {
    if (dragging !== handle || !containerRef.current) return;
    const { available, minShare } = measure();
    const rect = containerRef.current.getBoundingClientRect();
    // 境目の中心がポインタに来るよう、左にあるパネルの幅の合計を求める
    const before = handle === 0 ? 0 : sizes[0];
    const x = e.clientX - rect.left - HANDLE_PX * handle - HANDLE_PX / 2;
    // ドラッグ中は画面だけ更新し、保存は離したときに 1 回だけ行う
    setSizes(moveHandle(sizes, handle, x / available - before, minShare));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(null);
    saveSizes(sizes);
  };

  const onKeyDown = (handle: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = e.key === "ArrowLeft" ? -KEY_STEP : e.key === "ArrowRight" ? KEY_STEP : 0;
    if (delta === 0) return;
    e.preventDefault();
    update(moveHandle(sizes, handle, sizes[handle] + delta, measure().minShare));
  };

  const handle = (index: 0 | 1, label: string) => (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(sizes[index] * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      title="ドラッグで幅を変更（ダブルクリックで元に戻す）"
      onPointerDown={onPointerDown(index)}
      onPointerMove={onPointerMove(index)}
      onPointerUp={onPointerUp}
      onDoubleClick={() => update(DEFAULT_SIZES)}
      onKeyDown={onKeyDown(index)}
      className="group hidden cursor-col-resize touch-none items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-accent-ink lg:flex"
    >
      <span
        className={`h-12 w-1 rounded-full transition-colors group-hover:bg-accent-ink ${
          dragging === index ? "bg-accent-ink" : "bg-resizer"
        }`}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-3 lg:grid lg:min-h-0 lg:flex-1 lg:gap-0 ${dragging !== null ? "cursor-col-resize select-none" : ""}`}
      style={{
        // minmax(0, …) にしないと、エディタなどの中身の幅でパネルが押し広げられる
        gridTemplateColumns: `minmax(0, ${sizes[0]}fr) ${HANDLE_PX}px minmax(0, ${sizes[1]}fr) ${HANDLE_PX}px minmax(0, ${sizes[2]}fr)`,
      }}
    >
      {children[0]}
      {handle(0, "問題とエディタの境目")}
      {children[1]}
      {handle(1, "エディタと模範解答の境目")}
      {children[2]}
    </div>
  );
}
