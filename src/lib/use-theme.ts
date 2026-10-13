"use client";

import { useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "./theme";

// 初期値は layout の描画前スクリプトが <html data-theme> に入れた値を読む
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 保存できなくても、今の画面の切り替えはそのまま行う
    }
    setTheme(next);
  };

  return [theme, toggle];
}
