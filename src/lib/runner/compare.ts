// 出力の比較。各行の末尾の空白と、末尾の空行は無視する。

export function normalizeOutput(s: string): string {
  const lines = s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
