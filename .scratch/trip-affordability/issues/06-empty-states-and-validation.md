# 06 — 空狀態與輸入驗證

**What to build:** 拿到零結果的 Traveler，正好是這個產品最想幫助的人在最灰心的時刻。這張票要讓那一刻不變成一片空白。

關鍵在於分辨**是錢不夠、還是假不夠**——這是兩個完全不同的問題，Traveler 需要知道自己該解決哪一個。

**Blocked by:** 03, 04

**Status:** ready-for-agent

- [ ] 尚未填完輸入時，畫面安靜地不顯示結果，也不顯示錯誤
- [ ] Budget 或 Vacation Days 為 0 或負數時，清楚拒絕，不計算
- [ ] Vacation Days 只接受整數天
- [ ] 因假期不足導致零結果時，明確告知是天數的問題，並讓 Traveler 知道多請幾天能解鎖選項
- [ ] 因預算不足導致沒有任何 affordable 時，仍顯示 shortfall 區塊，不視為空狀態
- [ ] 訊息語氣不帶評價，不讓 Traveler 覺得被否定
- [ ] 空的 `destinations` 陣列回傳空陣列，不拋錯
