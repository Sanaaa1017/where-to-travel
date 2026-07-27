# 用 Vite + React，而不是既有的 Angular

這個 repo 的作者手上另一個專案（`lifecycle-demo`）是 Angular 21，所以選 React 看起來像是走岔了路——記下來是為了說明這不是疏忽。

核心的 Affordable / Shortfall 計算是純 TypeScript 函式，不依賴任何框架，因此框架只影響最外層的一層薄 UI，選擇成本比看起來低。在這個前提下我們選了生態較大、也是這套 skill 原生環境的 Vite + React；Angular 的既有熟悉度換來的效益，不足以抵過它在這種兩個輸入欄位的小專案上的重量。

測試一律用 Vitest——這點與 `lifecycle-demo` 一致，也是 `setup-pre-commit`、`migrate-to-shoehorn` 等 skill 假設的工具。

## Consequences

- 領域邏輯必須維持成不含 React 的純函式，框架才真的可以是薄的。這是這個決定成立的前提，不是附帶好處。
