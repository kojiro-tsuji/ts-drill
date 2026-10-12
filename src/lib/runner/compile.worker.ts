// 変換用の常駐 Worker。typescript の読み込みが重いので、1 つを使い回す。

import { transpile } from "./transpile";

export type CompileRequest = { id: number; code: string };

self.onmessage = (e: MessageEvent<CompileRequest>) => {
  const { id, code } = e.data;
  self.postMessage({ id, result: transpile(code) });
};
