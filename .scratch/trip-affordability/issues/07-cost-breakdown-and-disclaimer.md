# 07 — 成本明細與估算聲明

**What to build:** 讓 Traveler 看得懂錢花在哪，也知道這些數字是什麼性質的數字。

這張票處理的是信任。產品的全部價值建立在被相信之上，而 Traveler 遲早會去查真實票價——如果那時他覺得自己被誤導了，就再也不會回來。所以聲明不是法律免責文字，是產品的一部分。

**Blocked by:** 02

**Status:** ready-for-agent

- [x] 每個 Destination 可看到 Trip Cost 拆成機票、住宿、每日花費三項
- [x] 明確標示金額為單人、幣別為 TWD
- [x] 顯著位置說明這些是典型行情的估算，不是可成交的報價
- [x] ~~說明不問出發日期，因此不反映淡旺季價差~~（已由 ADR-0003 取代）
- [x] 說明不含簽證與入境相關費用，這部分需 Traveler 自行確認
- [x] 聲明必須看得到，不能折疊或藏在頁尾

## Comments

在 `redesign-home` 分支完成。明細拆成五項（機票、住宿、Food、Activities、Local Transport），並可逐項調整 Travel Style。「不反映淡旺季」這一條已被 ADR-0003 取代：現在可以選 Season，聲明改為「典型行情的估算，不是即時報價」。
