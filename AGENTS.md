<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## tsdrill

- `src/` の置き場所は役割で分ける。
  - `src/app/` … URL のルーティングだけ（`layout.tsx`、`page.tsx`、Next.js のファイル規約に沿うもの）。部品や処理は置かない。
  - `src/components/` … UI の部品（表示と操作）。状態の管理はしてよいが、計算・保存・設定などの処理は `src/lib/` に書いて呼ぶ。
  - `src/lib/` … UI を持たない機能（処理、型、設定、React フック）。`src/components/` を import しない。

- 問題を追加・修正するときは `docs/problem-authoring.md` に従う。サンプルの出力は `npm run verify -- --write <id>` で模範解答から作る。
- パッケージの追加・更新は `npx npm@10.9.2 install <パッケージ>` で行う（Cloudflare のビルドが npm 10.9.2 のため。詳細は `docs/deploy.md`）。
- コード実行エンジンは `src/lib/runner/`。`execute.ts` はブラウザの Worker と検証スクリプトの両方で使うので、DOM にも Node にも依存させない。
