/** 一個 Traveler 可能前往的地方。目前以國家為單位。 */
export type Destination = {
  id: string;
  name: string;
  /** 來回機票，TWD */
  flightCost: number;
  /** 每晚住宿，TWD */
  nightlyAccommodation: number;
  /** 每日花費，不含住宿，TWD */
  dailySpend: number;
  /** 單程飛行時數 */
  flightHours: number;
};

/** 針對一位 Traveler，一個 Destination 的評估結果。 */
export type TripPlan = {
  destination: Destination;
  /** 單人預估總花費，TWD */
  tripCost: number;
  status: 'affordable' | 'shortfall';
  /** 超出 Budget 的差額；affordable 時為 0 */
  shortfall: number;
};

export type TripInput = {
  budget: number;
  vacationDays: number;
};
