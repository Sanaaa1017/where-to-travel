/** 以台灣的月份劃分：春 3–5 月、夏 6–8 月、秋 9–11 月、冬 12–2 月。 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** 一個季節對某個 Destination 來說是淡季、平季還是旺季。 */
export type Demand = 'low' | 'shoulder' | 'peak';

/** 某一項花費要省、一般、還是寬鬆一點。 */
export type SpendLevel = 'save' | 'standard' | 'splurge';

/** Traveler 在住宿、餐飲、玩樂三項上各自想花到什麼程度。 */
export type TravelStyle = {
  stay: SpendLevel;
  food: SpendLevel;
  activities: SpendLevel;
};

/** 一個 Traveler 可能前往的地方。目前以國家（或地區）為單位。 */
export type Destination = {
  id: string;
  name: string;
  /** 來回經濟艙機票，平季行情，TWD */
  flightCost: number;
  /** 中價位住宿每晚，平季行情，TWD */
  nightlyAccommodation: number;
  /** 每日餐飲，TWD */
  dailyFood: number;
  /** 每日門票、體驗、活動，TWD */
  dailyActivities: number;
  /** 每日當地交通，TWD */
  dailyTransport: number;
  /** 單程飛行時數 */
  flightHours: number;
  /** 各季節的淡旺季，只影響機票與住宿 */
  seasons: Record<Season, Demand>;
};

/** Trip Cost 拆開後的五項，加總就是 Trip Cost。 */
export type CostBreakdown = {
  flight: number;
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
};

/** 估算一趟旅程需要的條件。 */
export type TripConditions = {
  vacationDays: number;
  /** null 表示還沒決定季節，用平季行情估算 */
  season: Season | null;
  style: TravelStyle;
};

export type TripInput = TripConditions & {
  budget: number;
};

/** 一位 Traveler 去一個 Destination 的估算，還沒跟 Budget 比較。 */
export type TripEstimate = {
  destination: Destination;
  breakdown: CostBreakdown;
  /** 單人預估總花費，TWD */
  tripCost: number;
};

/** 針對一位 Traveler，一個 Destination 跟 Budget 比較後的結果。 */
export type TripPlan = TripEstimate & {
  status: 'affordable' | 'shortfall';
  /** 超出 Budget 的差額；affordable 時為 0 */
  shortfall: number;
};
