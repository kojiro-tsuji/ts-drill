# デプロイ（Cloudflare Workers）

`next build` で静的ファイルを `out/` に書き出し、Cloudflare Workers の静的アセットとして配信する。サーバー側のコードはない。設定は `wrangler.jsonc`。

## 初回の設定（GitHub 連携）

1. Cloudflare のダッシュボードで **Workers & Pages** →「作成」→ **Import a repository** を選び、GitHub の `kojiro-tsuji/ts-drill` を選ぶ。
2. ビルドの設定を次のようにする（多くは自動で入る）。
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`（空欄のまま）
3. 「デプロイ」を押す。完了すると `https://ts-drill.<アカウント名>.workers.dev` で公開される。

以後は `main` に push するたびに自動でデプロイされる。

## ローカルでの確認

- `npm run preview` … ビルドして、Cloudflare と同じ配信方法で `http://localhost:8787` に立ち上げる。
- `npm run deploy` … 手元からデプロイする（初回は `npx wrangler login` でログインが必要）。GitHub 連携を使うなら不要。

## 注意

- `next.config.ts` の `output: "export"` を外すと静的書き出しにならず、このデプロイ方法は使えない。
- `cacheComponents` と `partialPrefetching` は静的書き出しと両立しないため使っていない。
- サーバーでの処理（API、ログインなど）が必要になったら、OpenNext（`@opennextjs/cloudflare`）への移行を検討する。
