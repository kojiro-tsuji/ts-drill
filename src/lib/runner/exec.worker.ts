// 実行用の Worker。サンプル 1 件ごとに作り直し、時間切れなら外から terminate する。

import { executeJs } from "./execute";

export type ExecRequest = { js: string; stdin: string };

self.onmessage = (e: MessageEvent<ExecRequest>) => {
  self.postMessage(executeJs(e.data.js, e.data.stdin));
};

// 読み込み完了を知らせ、ここから制限時間を数え始めてもらう
self.postMessage("ready");
