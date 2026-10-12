"use client";

import dynamic from "next/dynamic";

// 出題がランダムで、Monaco と Worker もブラウザ専用なので、サーバーでは描画しない
export const ClientApp = dynamic(() => import("@/components/tsdrill-app"), {
  ssr: false,
  loading: () => <div className="min-h-dvh bg-page" />,
});
