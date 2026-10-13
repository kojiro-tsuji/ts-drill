// 3 つのパネルの幅の比率。計算と、ブラウザへの保存・読み込みを受け持つ（表示は components/resizable-columns.tsx）

export type PaneSizes = [number, number, number];

const STORAGE_KEY = "tsdrill:pane-sizes";

// 参考デザインの flex-grow（1 : 1.3 : 1）に合わせた初期比率
export const DEFAULT_PANE_SIZES: PaneSizes = [1 / 3.3, 1.3 / 3.3, 1 / 3.3];

export function loadPaneSizes(): PaneSizes {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length === 3 && saved.every((v) => typeof v === "number" && v > 0)) {
      const total = saved[0] + saved[1] + saved[2];
      return [saved[0] / total, saved[1] / total, saved[2] / total];
    }
  } catch {
    // 読めなければ初期比率を使う
  }
  return DEFAULT_PANE_SIZES;
}

export function savePaneSizes(sizes: PaneSizes): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
  } catch {
    // 保存できなくても調整自体は効く
  }
}

// 境目 handle（0 = 左、1 = 右）の左右の 2 パネルだけで比率を分け直す。
// leftShare は左側パネルの新しい比率、minShare は 1 パネルの最小比率
export function moveHandle(sizes: PaneSizes, handle: 0 | 1, leftShare: number, minShare: number): PaneSizes {
  const next: PaneSizes = [...sizes];
  const pair = sizes[handle] + sizes[handle + 1];
  const left = Math.min(Math.max(leftShare, minShare), pair - minShare);
  next[handle] = left;
  next[handle + 1] = pair - left;
  return next;
}
