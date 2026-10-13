// エディタの雛形（starterCode）を作る。入力の受け取り方が初めてでも分かるよう、
// その問題の入力例 1 で input に何が入るかをコメントで示す。
// problems/*.json の starterCode は、verify スクリプトがこの関数で書き込む。

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
    'import * as fs from "fs";',
    "",
    "// 標準入力（左の「入力例」の内容）を 1 つの文字列として受け取り、",
    "// 改行で区切って 1 行ずつの配列にする",
    'const input: string[] = fs.readFileSync(0, "utf8").trim().split("\\n");',
    "",
    "// 入力例 1 のとき:",
    ...describeInput(sampleInput),
    "",
    "// 答えは console.log で出力する",
    "// ここに解答を書く",
    "",
  ].join("\n");
}
