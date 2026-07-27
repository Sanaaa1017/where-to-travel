# Trip Affordability

給「很想出國逃離、但一想到準備就累」的人使用。使用者輸入預算與可用假期，立刻看到現在去得起哪些國家，把「我到底能不能走」的模糊焦慮換成一份明確的可行清單。

## Language

**Traveler**:
使用這個網站的人。想出國、但被「要準備多少」擋住而遲遲沒有行動。
_Avoid_: User, 使用者, 客戶

**Budget**:
Traveler 願意為這趟旅程花的錢的上限。單一總額，不是每日金額。
_Avoid_: 預算範圍, price, cost

**Vacation Days**:
Traveler 手上可動用的假期天數。它同時是 Trip Cost 的乘數，也是可行性的限制——假期少於 Destination 的 Minimum Stay 時，那個 Destination 不會出現。
_Avoid_: 天數, duration, 時間

**Flight Time**:
從台灣飛到一個 Destination 的單程飛行時間。
_Avoid_: 航程, 飛多久, travel time

**Minimum Stay**:
一個 Destination 值得專程去一趟的最少天數，由它的 Flight Time 決定。用來擋掉「3 天假飛阿根廷」這種在金額上成立、實際上荒謬的建議。
_Avoid_: 最少天數, 門檻天數, minimum days

**Destination**:
Traveler 可能前往的地方。目前以「國家」為單位。
_Avoid_: 地點, 城市, place, country

**Trip Cost**:
**一位** Traveler 去一個 Destination 的預估總花費，由三項相加：來回機票、住宿、每日花費。這個產品只算單人，不處理結伴同行。
_Avoid_: 價格, 花費, total price

**Flight Cost**:
Trip Cost 的第一項。來回機票的預估金額。
_Avoid_: 機票錢, airfare

**Accommodation Cost**:
Trip Cost 的第二項。整趟住宿的預估金額，按晚計算。
_Avoid_: 住宿費, 飯店錢, hotel price

**Daily Spend**:
Trip Cost 的第三項。除住宿外，每天在當地的花費（餐食、當地交通、雜支）的預估金額。
_Avoid_: 生活費, 日常開銷, cost of living

**Affordable**:
一個 Destination 的 Trip Cost 不超過 Traveler 的 Budget。這是整個產品的核心判斷。
_Avoid_: 去得起, 買得起, 可負擔, within budget

**Shortfall**:
一個 Destination 的 Trip Cost 超出 Budget 的差額。每個 Destination 不是 Affordable，就是有 Shortfall。Shortfall 是「要準備多少」這個問題的答案。
_Avoid_: 差額, 缺口, 不夠的錢, gap, deficit
