import { describe, expect, it } from 'vitest';
import { destinations } from './destinations';

/** 唯一 import 真實資料的測試：只檢查資料本身完整，不檢查行為。 */
describe('destinations 資料集', () => {
  it('id 不重複', () => {
    const ids = destinations.map((destination) => destination.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(destinations)('$name 的所有金額與飛行時數都是正數', (destination) => {
    for (const value of [
      destination.flightCost,
      destination.nightlyAccommodation,
      destination.dailyFood,
      destination.dailyActivities,
      destination.dailyTransport,
      destination.flightHours,
    ]) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it.each(destinations)('$name 四季都標了淡季、平季或旺季', (destination) => {
    for (const demand of Object.values(destination.seasons)) {
      expect(['low', 'shoulder', 'peak']).toContain(demand);
    }
    expect(Object.keys(destination.seasons)).toHaveLength(4);
  });
});
