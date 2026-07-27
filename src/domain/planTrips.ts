import type { Destination, TripInput, TripPlan } from './types';

function tripCostOf(destination: Destination, vacationDays: number): number {
  return (
    destination.flightCost +
    destination.nightlyAccommodation * vacationDays +
    destination.dailySpend * vacationDays
  );
}

export function planTrips(input: TripInput, destinations: Destination[]): TripPlan[] {
  return destinations
    .map((destination) => ({
      destination,
      tripCost: tripCostOf(destination, input.vacationDays),
      status: 'affordable' as const,
      shortfall: 0,
    }))
    .filter((plan) => plan.tripCost <= input.budget)
    .sort(byCostDescendingThenName);
}

/**
 * 預算內最貴的排最前面——Traveler 第一眼看到的應該是他去得起的最好的地方。
 * 金額相同時以名稱決勝，純粹是為了讓順序穩定可預期。
 */
function byCostDescendingThenName(a: TripPlan, b: TripPlan): number {
  if (a.tripCost !== b.tripCost) return b.tripCost - a.tripCost;
  return a.destination.name < b.destination.name ? -1 : 1;
}
