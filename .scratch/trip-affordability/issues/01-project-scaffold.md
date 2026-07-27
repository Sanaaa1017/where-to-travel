# 01 — 專案骨架

**What to build:** 一個跑得起來的空專案。開發者 clone 下來、裝完套件後，能啟動開發伺服器看到頁面，也能跑測試並看到測試通過。此後每一張票都建立在這個地基上。

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Vite + React + TypeScript 專案建立完成
- [x] Vitest 設定完成，`npm test` 可執行
- [x] 至少一個會通過的測試存在，證明測試管線是通的
- [x] `npm run dev` 能開出頁面
- [x] Prettier 設定與 `lifecycle-demo` 一致
- [x] TypeScript 為 strict 模式
- [x] 原始碼分成「領域邏輯」與「UI」兩區，領域區不得 import React（ADR-0002 的前提）
