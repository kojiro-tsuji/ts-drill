// 出題する問題の選び方（難易度での絞り込みとランダム選択）

import type { Difficulty, Problem } from "./problem";

export type DifficultyFilter = Difficulty | "all";

export function matchesDifficulty(problem: Problem, filter: DifficultyFilter): boolean {
  return filter === "all" || problem.difficulty === filter;
}

// pool から exclude 以外をランダムに 1 問選ぶ。候補がなければ exclude（なければ先頭）を返す
export function pickRandomProblem(pool: Problem[], exclude?: Problem): Problem {
  const candidates = pool.filter((p) => p !== exclude);
  if (candidates.length === 0) return exclude ?? pool[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 難易度ごとの問題数
export function countByDifficulty(problems: Problem[]): Map<Difficulty, number> {
  const counts = new Map<Difficulty, number>();
  for (const p of problems) counts.set(p.difficulty, (counts.get(p.difficulty) ?? 0) + 1);
  return counts;
}
