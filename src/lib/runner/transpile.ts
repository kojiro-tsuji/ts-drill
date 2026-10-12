// TypeScript → JS（CommonJS）変換。型検査はせず、構文エラーだけを返す。

import ts from "typescript";

export type CompileError = { line: number; column: number; message: string };

export type CompileResult = { ok: true; js: string } | { ok: false; errors: CompileError[] };

export function transpile(code: string): CompileResult {
  const out = ts.transpileModule(code, {
    fileName: "solution.ts",
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });

  const diagnostics = out.diagnostics ?? [];
  if (diagnostics.length === 0) return { ok: true, js: out.outputText };

  const source = ts.createSourceFile("solution.ts", code, ts.ScriptTarget.ES2022);
  const errors = diagnostics.map((d) => {
    const pos = source.getLineAndCharacterOfPosition(d.start ?? 0);
    return {
      line: pos.line + 1,
      column: pos.character + 1,
      message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
    };
  });
  return { ok: false, errors };
}
