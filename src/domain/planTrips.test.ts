import { describe, expect, it } from 'vitest';
import { planTrips } from './planTrips';
import type { Destination } from './types';

/**
 * 測試自備的 Destination，與真實資料集無關。
 * 預設為短程航班，這樣未來加上 Minimum Stay 過濾時，
 * 這些測試不會因為被過濾掉而「用錯誤的理由通過」。
 */
function destination(overrides: Partial<Destination> & { id: string }): Destination {
  return {
    name: overrides.id,
    flightCost: 10000,
    nightlyAccommodation: 2000,
    dailySpend: 1000,
    flightHours: 3,
    ...overrides,
  };
}

describe('planTrips', () => {
  it('把 Trip Cost 沒超過 Budget 的 Destination 標成 affordable', () => {
    const japan: Destination = {
      id: 'JP',
      name: '日本',
      flightCost: 15000,
      nightlyAccommodation: 3000,
      dailySpend: 2000,
      flightHours: 3,
    };

    // 15000 機票 + 3000×5 住宿 + 2000×5 日花 = 40000
    const plans = planTrips({ budget: 100000, vacationDays: 5 }, [japan]);

    expect(plans).toEqual([
      { destination: japan, tripCost: 40000, status: 'affordable', shortfall: 0 },
    ]);
  });

  it('不回傳 Trip Cost 超過 Budget 的 Destination', () => {
    const withinBudget = destination({ id: 'within', flightCost: 10000 });
    const overBudget = destination({ id: 'over', flightCost: 90000 });

    // 5 天：within = 10000 + 15000 = 25000，over = 90000 + 15000 = 105000
    const plans = planTrips({ budget: 100000, vacationDays: 5 }, [withinBudget, overBudget]);

    expect(plans.map((plan) => plan.destination.id)).toEqual(['within']);
  });

  it('Trip Cost 恰好等於 Budget 時仍算 affordable', () => {
    const exact = destination({ id: 'exact', flightCost: 10000 });

    // 5 天：10000 + 2000×5 + 1000×5 = 25000，與 Budget 相同
    const plans = planTrips({ budget: 25000, vacationDays: 5 }, [exact]);

    expect(plans.map((plan) => plan.destination.id)).toEqual(['exact']);
  });

  it('把最接近 Budget 的 Destination 排在最前面', () => {
    const cheap = destination({ id: 'cheap', flightCost: 10000 });
    const mid = destination({ id: 'mid', flightCost: 30000 });
    const pricey = destination({ id: 'pricey', flightCost: 50000 });

    const plans = planTrips({ budget: 100000, vacationDays: 5 }, [cheap, pricey, mid]);

    expect(plans.map((plan) => plan.destination.id)).toEqual(['pricey', 'mid', 'cheap']);
  });

  it('金額相同時依名稱排序，讓順序穩定', () => {
    const beta = destination({ id: 'beta', name: 'Beta' });
    const alpha = destination({ id: 'alpha', name: 'Alpha' });

    const plans = planTrips({ budget: 100000, vacationDays: 5 }, [beta, alpha]);

    expect(plans.map((plan) => plan.destination.name)).toEqual(['Alpha', 'Beta']);
  });
});
