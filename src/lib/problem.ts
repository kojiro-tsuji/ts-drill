export type Problem = {
  id: string;
  title: string;
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
