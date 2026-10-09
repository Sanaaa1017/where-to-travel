# 03 — 「再存一點就能去」區塊

**What to build:** 去不起的 Destination 不再消失。Traveler 現在會看到第二個區塊，列出超出預算的國家，每個都標明還差多少錢，差最少的排最前面。

這回答的是「要準備多少」——沒有這個，產品只回答了 Traveler 一半的焦慮。

**Blocked by:** 02

**Status:** ready-for-agent

- [x] Trip Cost > Budget 的 Destination 回傳 `status: 'shortfall'`，並帶正確的 `shortfall` 金額
- [x] `shortfall` 為 Trip Cost 與 Budget 的差額
- [x] 回傳陣列中，所有 affordable 排在所有 shortfall 之前
- [x] shortfall 之間依差額由小到大排序，差額相同時以名稱排序
- [x] 畫面分成「你去得起」與「再存一點就能去」兩區，視覺上可一眼分辨
- [x] 每筆 shortfall 顯示還差多少（TWD）
- [x] 涵蓋「完全沒有任何 Destination 去得起」的情況，此時只回傳 shortfall

## Comments

在 `redesign-home` 分支完成。畫面上的區塊名稱改為英文 “Save a bit more”。
