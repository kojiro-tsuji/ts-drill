"use client";

// Monaco を使った編集用エディタと、模範解答用の読み取り専用ビュー

import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { jetbrainsMono } from "@/app/fonts";
import { setupMonaco, THEME } from "./monaco-setup";

const baseOptions: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: jetbrainsMono.style.fontFamily,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  folding: false,
  glyphMargin: false,
  lineDecorationsWidth: 12,
  tabSize: 2,
  bracketPairColorization: { enabled: false },
  guides: { bracketPairs: false, indentation: true },
};

// Web フォントの読み込み後に文字幅を測り直す（測り直さないとカーソル位置がずれる）
const remeasureAfterFonts: OnMount = (_editor, monaco) => {
  void document.fonts.ready.then(() => monaco.editor.remeasureFonts());
};

const placeholder = <div className="h-full w-full bg-code" />;

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onCursorChange: (line: number, column: number) => void;
};

export function CodeEditor({ value, onChange, onCursorChange }: CodeEditorProps) {
  return (
    <Editor
      path="file:///solution.ts"
      language="typescript"
      theme={THEME}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      beforeMount={setupMonaco}
      onMount={(ed, monaco) => {
        remeasureAfterFonts(ed, monaco);
        ed.onDidChangeCursorPosition((e) => onCursorChange(e.position.lineNumber, e.position.column));
      }}
      loading={placeholder}
      options={{
        ...baseOptions,
        fontSize: 14,
        padding: { top: 14, bottom: 14 },
        lineNumbersMinChars: 3,
        renderLineHighlight: "all",
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoSurround: "languageDefined",
        matchBrackets: "always",
      }}
    />
  );
}

const VIEWER_LINE_HEIGHT = 22;
const VIEWER_PADDING = 12;

export function CodeViewer({ code }: { code: string }) {
  // 末尾の改行で空の行が 1 つ増えないよう取り除く
  const trimmed = code.replace(/\n+$/, "");
  const lines = trimmed.split("\n").length;
  return (
    <Editor
      path="file:///answer.ts"
      language="typescript"
      theme={THEME}
      value={trimmed}
      height={lines * VIEWER_LINE_HEIGHT + VIEWER_PADDING * 2}
      beforeMount={setupMonaco}
      onMount={remeasureAfterFonts}
      loading={placeholder}
      options={{
        ...baseOptions,
        fontSize: 13,
        lineHeight: VIEWER_LINE_HEIGHT,
        padding: { top: VIEWER_PADDING, bottom: VIEWER_PADDING },
        lineNumbersMinChars: 2,
        readOnly: true,
        domReadOnly: true,
        renderLineHighlight: "none",
        renderValidationDecorations: "off",
        matchBrackets: "never",
        occurrencesHighlight: "off",
        selectionHighlight: false,
        contextmenu: false,
        guides: { indentation: false },
        scrollbar: { vertical: "hidden", horizontal: "auto", alwaysConsumeMouseWheel: false },
      }}
    />
  );
}
