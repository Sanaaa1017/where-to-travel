# 04 — 假期不夠的國家不出現

**What to build:** 清單不再出現荒謬的建議。只有 3 天假的 Traveler 不會看到阿根廷——即使金額上算得出來去得起，因為光飛行就要兩天。

每個 Destination 依飛行時數推出一個 Minimum Stay，假期不足者從結果中完全排除，兩個區塊都不出現。

**Blocked by:** 02

**Status:** ready-for-agent

- [x] Minimum Stay 由 `flightHours` 推導，不另存欄位
- [x] 單程 < 4 小時 → 至少 3 天
- [x] 單程 4–10 小時 → 至少 5 天
- [x] 單程 > 10 小時 → 至少 8 天
- [x] Vacation Days 小於 Minimum Stay 的 Destination 完全不出現在回傳結果中
- [x] 4 小時與 10 小時兩個級距邊界的行為有測試涵蓋
- [x] 涵蓋「所有 Destination 都因假期不足被排除」的情況，此時回傳空陣列
- [x] 畫面上讓 Traveler 看得出某個 Destination 最少需要幾天

## Comments

在 `redesign-home` 分支完成。被排除的 Destination 在清單底部 “Need more days” 區塊列出最少天數，明細面板也會提示並提供「補到最少天數」的按鈕。
