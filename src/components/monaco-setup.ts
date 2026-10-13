// Monaco の初期設定: 読み込み元、配色テーマ、ハイライト規則、TypeScript の型情報

import { loader, type Monaco } from "@monaco-editor/react";
import type { languages } from "monaco-editor";
import type { Theme } from "@/lib/theme";

// 型定義（node_modules の monaco-editor）と同じ版を CDN から読み込む
loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.57.0/min/vs" } });

export const MONACO_THEMES: Record<Theme, string> = { dark: "tsdrill-dark", light: "tsdrill-light" };

// 問題のコードが使う Node の API だけを型として宣言する（実体は Worker 内の模擬）
const nodeTypes = `
declare module "fs" {
  export function readFileSync(
    path: number | string,
    options?: string | { encoding?: string | null; flag?: string } | null,
  ): string;
}
declare module "node:fs" {
  export * from "fs";
}
declare var process: {
  argv: string[];
  env: Record<string, string | undefined>;
  stdout: { write(s: string): boolean };
  stderr: { write(s: string): boolean };
  exit(code?: number): never;
};
`;

// 関数名・組み込みを色分けするための、TypeScript 用の簡易なハイライト規則
const tsLanguage: languages.IMonarchLanguage = {
  defaultToken: "identifier",
  tokenPostfix: ".ts",
  keywords: [
    "abstract", "as", "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "declare", "default", "delete", "do", "else", "enum", "export", "extends", "false",
    "finally", "for", "from", "function", "get", "if", "implements", "import", "in", "instanceof",
    "interface", "is", "keyof", "let", "namespace", "new", "null", "of", "private", "protected",
    "public", "readonly", "return", "satisfies", "set", "static", "super", "switch", "this", "throw",
    "true", "try", "type", "typeof", "undefined", "var", "while", "with", "yield",
  ],
  typeKeywords: ["any", "bigint", "boolean", "never", "number", "object", "string", "symbol", "unknown", "void"],
  builtins: [
    "Array", "BigInt", "Boolean", "console", "Date", "Infinity", "JSON", "Map", "Math", "NaN",
    "Number", "Object", "parseFloat", "parseInt", "process", "Promise", "RegExp", "Set", "String", "Symbol",
  ],
  symbols: /[=><!~?:&|+\-*/^%]+/,
  escapes: /\\(?:[abfnrtv\\"'`$]|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]+\})/,
  brackets: [
    { open: "{", close: "}", token: "delimiter.curly" },
    { open: "[", close: "]", token: "delimiter.square" },
    { open: "(", close: ")", token: "delimiter.parenthesis" },
  ],
  tokenizer: {
    root: [
      { include: "@whitespace" },
      // 直後に ( が来る識別子は関数呼び出し・関数定義とみなす
      [/[a-zA-Z_$][\w$]*(?=\s*\()/, { cases: { "@keywords": "keyword", "@builtins": "builtin", "@default": "function" } }],
      [
        /[a-zA-Z_$][\w$]*/,
        { cases: { "@keywords": "keyword", "@typeKeywords": "type", "@builtins": "builtin", "@default": "identifier" } },
      ],
      [/[{}()[\]]/, "@brackets"],
      [/@symbols/, "operator"],
      [/0[xX][0-9a-fA-F_]+n?/, "number"],
      [/\d[\d_]*(\.\d+)?([eE][-+]?\d+)?n?/, "number"],
      [/[;,.]/, "delimiter"],
      [/"/, "string", "@stringDouble"],
      [/'/, "string", "@stringSingle"],
      [/`/, "string", "@stringBacktick"],
    ],
    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"],
    ],
    comment: [
      [/[^/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[/*]/, "comment"],
    ],
    stringDouble: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape"],
      [/"/, "string", "@pop"],
    ],
    stringSingle: [
      [/[^\\']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape"],
      [/'/, "string", "@pop"],
    ],
    stringBacktick: [
      [/\$\{/, { token: "delimiter.bracket", next: "@templateExpr" }],
      [/[^\\`$]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape"],
      [/`/, "string", "@pop"],
      [/\$/, "string"],
    ],
    templateExpr: [
      [/\{/, "delimiter.bracket", "@templateExpr"],
      [/\}/, "delimiter.bracket", "@pop"],
      { include: "root" },
    ],
  },
};

let initialized = false;

export function setupMonaco(monaco: Monaco): void {
  if (initialized) return;
  initialized = true;

  const ts = monaco.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    strict: true,
    noEmit: true,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
  });
  ts.typescriptDefaults.addExtraLib(nodeTypes, "file:///node-shim.d.ts");

  monaco.languages.setMonarchTokensProvider("typescript", tsLanguage);

  monaco.editor.defineTheme(MONACO_THEMES.dark, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "E8EAEE" },
      { token: "identifier", foreground: "E8EAEE" },
      { token: "keyword", foreground: "C79BFF" },
      { token: "string", foreground: "9BE37A" },
      { token: "number", foreground: "FFB86B" },
      { token: "type", foreground: "6CD0FF" },
      { token: "function", foreground: "8FB4FF" },
      { token: "comment", foreground: "7C8798", fontStyle: "italic" },
      { token: "builtin", foreground: "FF8FAF" },
      { token: "operator", foreground: "AAB2C0" },
      { token: "delimiter", foreground: "AAB2C0" },
    ],
    colors: {
      "editor.background": "#0F1218",
      "editor.foreground": "#E8EAEE",
      "editorGutter.background": "#0F1218",
      "editorLineNumber.foreground": "#758094",
      "editorLineNumber.activeForeground": "#E8EAEE",
      "editor.lineHighlightBackground": "#FFFFFF0D",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#C4F44D",
      "editor.selectionBackground": "#3A4250",
      "editorBracketMatch.background": "#C4F44D33",
      "editorBracketMatch.border": "#C4F44DBF",
      "editorIndentGuide.background1": "#1E232C",
      "editorIndentGuide.activeBackground1": "#2A303B",
      "editorWidget.background": "#12151B",
      "editorWidget.border": "#2A303B",
      "scrollbarSlider.background": "#2A303B80",
      "scrollbarSlider.hoverBackground": "#3A4250",
      "scrollbarSlider.activeBackground": "#3A4250",
    },
  });

  // ライト用。白い背景でも読めるよう、各色をダークより濃くしている
  monaco.editor.defineTheme(MONACO_THEMES.light, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: "161A21" },
      { token: "identifier", foreground: "161A21" },
      { token: "keyword", foreground: "8A3FD1" },
      { token: "string", foreground: "2E7D1A" },
      { token: "number", foreground: "B25A00" },
      { token: "type", foreground: "0B76AD" },
      { token: "function", foreground: "2F5BC9" },
      { token: "comment", foreground: "6B7585", fontStyle: "italic" },
      { token: "builtin", foreground: "C2185B" },
      { token: "operator", foreground: "5A6372" },
      { token: "delimiter", foreground: "5A6372" },
    ],
    colors: {
      "editor.background": "#F7F8FA",
      "editor.foreground": "#161A21",
      "editorGutter.background": "#F7F8FA",
      "editorLineNumber.foreground": "#8C95A3",
      "editorLineNumber.activeForeground": "#161A21",
      "editor.lineHighlightBackground": "#0000000A",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#4A7300",
      "editor.selectionBackground": "#C9D9F2",
      "editorBracketMatch.background": "#C4F44D66",
      "editorBracketMatch.border": "#4A7300",
      "editorIndentGuide.background1": "#E1E4E9",
      "editorIndentGuide.activeBackground1": "#C5CBD4",
      "editorWidget.background": "#FFFFFF",
      "editorWidget.border": "#D3D8DF",
      "scrollbarSlider.background": "#C5CBD480",
      "scrollbarSlider.hoverBackground": "#AEB5C0",
      "scrollbarSlider.activeBackground": "#AEB5C0",
    },
  });
}
