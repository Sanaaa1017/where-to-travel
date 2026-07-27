# 02 — 曳光彈：填預算與假期，看到去得起的國家

**What to build:** 產品的第一條完整貫穿路徑。Traveler 打開網頁，填入 Budget 與 Vacation Days，立刻看到一份他去得起的 Destination 清單，預算內最貴的排在最前面。

這張票刻意只做一半的功能——去不起的國家、假期不夠的過濾都不在這裡。但它從型別、領域邏輯、測試到畫面是完整貫穿的，做完就是一個能給人看、能真的用的東西。

**Blocked by:** 01

**Status:** done

- [x] `Destination` 與 `TripPlan` 型別定義完成，形狀與 spec 一致
- [x] `planTrips` 存在，接受 `{ budget, vacationDays }` 與一個 `destinations` 陣列，回傳 `TripPlan[]`
- [x] `destinations` 是參數而非 import——這是接縫可測的前提
- [x] Trip Cost 計算為：機票 + 每晚住宿 × 天數 + 每日花費 × 天數（單人）
- [x] Trip Cost ≤ Budget 的 Destination 回傳 `status: 'affordable'`、`shortfall: 0`
- [x] Trip Cost 恰好等於 Budget 時算 affordable（邊界含等於）
- [x] 結果依 Trip Cost 由高到低排序，金額相同時以名稱排序確保順序穩定
- [x] 超出預算的 Destination 此階段直接不回傳
- [x] 內建 3–4 國種子資料，足以讓畫面有東西可看
- [x] 畫面有 Budget 與 Vacation Days 兩個輸入欄，填完即時顯示清單
- [x] 每筆顯示國家名稱與 Trip Cost（TWD）
- [x] 測試只透過 `planTrips` 驗證行為，且自備 fixture、不 import 真實資料
