import type {
  CostBreakdown,
  Demand,
  Destination,
  SpendLevel,
  TravelStyle,
  TripConditions,
  TripEstimate,
  TripInput,
  TripPlan,
} from './types';

/** 淡旺季只影響機票和住宿——吃飯和門票不太會因為季節變貴。見 ADR-0003。 */
const DEMAND_FACTOR: Record<Demand, number> = { low: 0.85, shoulder: 1, peak: 1.3 };

const STAY_FACTOR: Record<SpendLevel, number> = { save: 0.45, standard: 1, splurge: 2.2 };
const FOOD_FACTOR: Record<SpendLevel, number> = { save: 0.6, standard: 1, splurge: 1.8 };
const ACTIVITIES_FACTOR: Record<SpendLevel, number> = { save: 0.5, standard: 1, splurge: 1.8 };

/** 三項都選「一般」，就是資料集裡的原始數字。 */
export const standardStyle: TravelStyle = {
  stay: 'standard',
  food: 'standard',
  activities: 'standard',
};

/**
 * 一個 Destination 值得專程去一趟的最少天數，由單程飛行時數決定。
 * 用來擋掉「3 天假飛阿根廷」這種金額上成立、實際上荒謬的建議。
 */
export function minimumStayOf(destination: Destination): number {
  if (destination.flightHours < 4) return 3;
  if (destination.flightHours <= 10) return 5;
  return 8;
}

/**
 * 估算一位 Traveler 去一個 Destination 的花費，不管天數夠不夠、也不跟 Budget 比較。
 *
 * 住宿以「晚數 = 假期天數」計算，刻意略為高估——寧可多準備，也不要讓人到了當地才發現不夠。
 */
export function estimateTrip(destination: Destination, conditions: TripConditions): TripEstimate {
  const { vacationDays: days, season, style } = conditions;
  const demand = season ? DEMAND_FACTOR[destination.seasons[season]] : 1;

  // 先把「每晚」「每天」的單價取到百位再乘天數，畫面上的「7 晚 × 3,000」才會剛好等於小計。
  const breakdown: CostBreakdown = {
    flight: toHundreds(destination.flightCost * demand),
    accommodation:
      toHundreds(destination.nightlyAccommodation * demand * STAY_FACTOR[style.stay]) * days,
    food: toHundreds(destination.dailyFood * FOOD_FACTOR[style.food]) * days,
    activities:
      toHundreds(destination.dailyActivities * ACTIVITIES_FACTOR[style.activities]) * days,
    transport: toHundreds(destination.dailyTransport) * days,
  };

  return { destination, breakdown, tripCost: sumOf(breakdown) };
}

/** 假期夠去的 Destination 各自要花多少，便宜的排前面。還沒決定 Budget 時用這個。 */
export function estimateTrips(
  conditions: TripConditions,
  destinations: Destination[],
): TripEstimate[] {
  return destinations
    .filter((destination) => minimumStayOf(destination) <= conditions.vacationDays)
    .map((destination) => estimateTrip(destination, conditions))
    .sort((a, b) => a.tripCost - b.tripCost || byName(a, b));
}

export function planTrips(input: TripInput, destinations: Destination[]): TripPlan[] {
  return estimateTrips(input, destinations)
    .map((estimate): TripPlan => {
      const shortfall = Math.max(0, estimate.tripCost - input.budget);
      return { ...estimate, status: shortfall > 0 ? 'shortfall' : 'affordable', shortfall };
    })
    .sort(byDisplayOrder);
}

/**
 * 去得起的全部排在前面，預算內最貴的排第一——Traveler 第一眼看到的是他去得起的最好的地方。
 * 去不起的接在後面，差最少的排第一——最接近成真的那幾個最顯眼。
 * 金額相同時以名稱決勝，純粹是為了讓順序穩定可預期。
 */
function byDisplayOrder(a: TripPlan, b: TripPlan): number {
  if (a.status !== b.status) return a.status === 'affordable' ? -1 : 1;
  if (a.status === 'affordable') return b.tripCost - a.tripCost || byName(a, b);
  return a.shortfall - b.shortfall || byName(a, b);
}

function byName(a: TripEstimate, b: TripEstimate): number {
  return a.destination.name < b.destination.name ? -1 : 1;
}

/** 估算值寫到個位數只是假裝精準，一律取到百位。 */
function toHundreds(value: number): number {
  return Math.round(value / 100) * 100;
}

function sumOf(breakdown: CostBreakdown): number {
  return (
    breakdown.flight +
    breakdown.accommodation +
    breakdown.food +
    breakdown.activities +
    breakdown.transport
  );
}
