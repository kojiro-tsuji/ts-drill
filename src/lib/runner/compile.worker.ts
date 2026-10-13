// 変換用の常駐 Worker。typescript の読み込みが重いので、1 つを使い回す。

import { transpile } from "./transpile";

export type CompileRequest = { id: number; code: string };

self.onmessage = (e: MessageEvent<CompileRequest>) => {
  const { id, code } = e.data;
  try {
    self.postMessage({ id, result: transpile(code) });
  } catch (err) {
    // 変換器自体の例外。返事をしないと呼び出し側が待ち続けるので、必ずエラーとして返す
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
