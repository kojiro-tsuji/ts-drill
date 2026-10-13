// エディタの雛形（starterCode）を作る。入力の受け取り方が初めてでも分かるよう、
// その問題の入力例 1 で input に何が入るかをコメントで示す。
// problems/*.json の starterCode は、verify スクリプトがこの関数で書き込む。

// 入力を読む 2 行。雛形も模範解答もこの形で読み、以降は input から値を取り出す
export const IMPORT_LINE = 'import * as fs from "fs";';
export const READ_INPUT_LINE = 'const input: string[] = fs.readFileSync(0, "utf8").trim().split("\\n");';

// 模範解答の先頭はこの形にそろえる（雛形の「ここに解答を書く」の続きとして読めるように）
export const SOLUTION_HEADER = `${IMPORT_LINE}\n\n${READ_INPUT_LINE}\n`;

const MAX_LINES = 4;
const MAX_LINE_CHARS = 40;

// input[i] に入る文字列を、コメントに載せられる長さで表す
function describeLine(line: string): string {
  if (line.length <= MAX_LINE_CHARS) return JSON.stringify(line);
  return `${JSON.stringify(line.slice(0, MAX_LINE_CHARS))} …（長いので途中まで）`;
}

function describeInput(sampleInput: string): string[] {
  const lines = sampleInput.trim().split("\n");
  const shown = lines.length <= MAX_LINES ? lines : lines.slice(0, MAX_LINES - 1);
  const out = shown.map((line, i) => `//   input[${i}] は ${describeLine(line)}`);
  if (shown.length < lines.length) {
    out.push(`//   …（全 ${lines.length} 行。最後は input[${lines.length - 1}]）`);
  }
  return out;
}

export function buildStarterCode(sampleInput: string): string {
  return [
    IMPORT_LINE,
    "",
    "// 標準入力（左の「入力例」の内容）を 1 つの文字列として受け取り、",
    "// 改行で区切って 1 行ずつの配列にする",
    READ_INPUT_LINE,
    "",
    "// 入力例 1 のとき:",
    ...describeInput(sampleInput),
    "",
    "// 答えは console.log で出力する",
    "// ここに解答を書く",
    "",
  ].join("\n");
}
