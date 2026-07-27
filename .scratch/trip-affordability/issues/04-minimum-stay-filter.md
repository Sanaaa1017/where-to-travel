# 04 — 假期不夠的國家不出現

**What to build:** 清單不再出現荒謬的建議。只有 3 天假的 Traveler 不會看到阿根廷——即使金額上算得出來去得起，因為光飛行就要兩天。

每個 Destination 依飛行時數推出一個 Minimum Stay，假期不足者從結果中完全排除，兩個區塊都不出現。

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Minimum Stay 由 `flightHours` 推導，不另存欄位
- [ ] 單程 < 4 小時 → 至少 3 天
- [ ] 單程 4–10 小時 → 至少 5 天
- [ ] 單程 > 10 小時 → 至少 8 天
- [ ] Vacation Days 小於 Minimum Stay 的 Destination 完全不出現在回傳結果中
- [ ] 4 小時與 10 小時兩個級距邊界的行為有測試涵蓋
- [ ] 涵蓋「所有 Destination 都因假期不足被排除」的情況，此時回傳空陣列
- [ ] 畫面上讓 Traveler 看得出某個 Destination 最少需要幾天
