export type Difficulty = 1 | 2 | 3 | 4 | 5;

// 難易度の目安は docs/problem-authoring.md を参照
export const DIFFICULTIES: { level: Difficulty; label: string }[] = [
  { level: 1, label: "入門" },
  { level: 2, label: "初級" },
  { level: 3, label: "中級" },
  { level: 4, label: "上級" },
  { level: 5, label: "最上級" },
];

export function difficultyLabel(level: Difficulty): string {
  return DIFFICULTIES.find((d) => d.level === level)?.label ?? String(level);
}

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  statement: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  timeLimitMs: number;
  samples: { input: string; output: string }[];
  hiddenTests: { input: string; output: string }[]; // 今回は空配列
  starterCode: string;
  solution: {
    code: string;
    explanation: { lead: string; body: string }[];
  };
};
