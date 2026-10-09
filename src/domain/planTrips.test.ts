import { describe, expect, it } from 'vitest';
import { estimateTrip, estimateTrips, minimumStayOf, planTrips, standardStyle } from './planTrips';
import type { Destination, TripConditions } from './types';

/**
 * 測試自備的 Destination，與真實資料集無關。
 * 預設為短程航班（Minimum Stay 3 天）、四季都是平季，
 * 這樣測試不會因為被 Minimum Stay 或淡旺季影響而「用錯誤的理由通過」。
 * 每日三項加起來是 1000，方便心算。
 */
function destination(overrides: Partial<Destination> & { id: string }): Destination {
  return {
    name: overrides.id,
    flightCost: 10000,
    nightlyAccommodation: 2000,
    dailyFood: 600,
    dailyActivities: 300,
    dailyTransport: 100,
    flightHours: 3,
    seasons: { spring: 'shoulder', summer: 'shoulder', autumn: 'shoulder', winter: 'shoulder' },
    ...overrides,
  };
}

function conditions(overrides: Partial<TripConditions> = {}): TripConditions {
  return { vacationDays: 5, season: null, style: standardStyle, ...overrides };
}

const ids = (items: { destination: Destination }[]) => items.map((item) => item.destination.id);

describe('estimateTrip', () => {
  it('把 Trip Cost 拆成機票、住宿、餐飲、玩樂、交通五項', () => {
    const japan = destination({
      id: 'JP',
      flightCost: 15000,
      nightlyAccommodation: 3000,
      dailyFood: 1200,
      dailyActivities: 500,
      dailyTransport: 300,
    });

    const estimate = estimateTrip(japan, conditions({ vacationDays: 5 }));

    expect(estimate.breakdown).toEqual({
      flight: 15000,
      accommodation: 15000,
      food: 6000,
      activities: 2500,
      transport: 1500,
    });
    expect(estimate.tripCost).toBe(40000);
  });

  it('旺季時機票與住宿變貴，餐飲、玩樂、交通不變', () => {
    const peakInSpring = destination({
      id: 'peak',
      seasons: { spring: 'peak', summer: 'shoulder', autumn: 'shoulder', winter: 'low' },
    });

    const spring = estimateTrip(peakInSpring, conditions({ season: 'spring' }));

    expect(spring.breakdown).toEqual({
      flight: 13000,
      accommodation: 2600 * 5,
      food: 600 * 5,
      activities: 300 * 5,
      transport: 100 * 5,
    });
  });

  it('淡季時機票與住宿變便宜', () => {
    const lowInWinter = destination({
      id: 'low',
      seasons: { spring: 'shoulder', summer: 'shoulder', autumn: 'shoulder', winter: 'low' },
    });

    const winter = estimateTrip(lowInWinter, conditions({ season: 'winter' }));

    expect(winter.breakdown.flight).toBe(8500);
    expect(winter.breakdown.accommodation).toBe(1700 * 5);
  });

  it('還沒決定季節時用平季行情', () => {
    const seasonal = destination({
      id: 'seasonal',
      seasons: { spring: 'peak', summer: 'peak', autumn: 'low', winter: 'low' },
    });

    const anySeason = estimateTrip(seasonal, conditions({ season: null }));

    expect(anySeason.breakdown.flight).toBe(10000);
  });

  it('住宿、餐飲、玩樂可以各自選省一點或寬鬆一點', () => {
    const place = destination({ id: 'place' });

    const thrifty = estimateTrip(
      place,
      conditions({ style: { stay: 'save', food: 'save', activities: 'save' } }),
    );
    const lavish = estimateTrip(
      place,
      conditions({ style: { stay: 'splurge', food: 'splurge', activities: 'splurge' } }),
    );

    expect(thrifty.breakdown).toMatchObject({
      accommodation: 900 * 5,
      food: 400 * 5,
      activities: 200 * 5,
      transport: 100 * 5,
    });
    expect(lavish.breakdown).toMatchObject({
      accommodation: 4400 * 5,
      food: 1100 * 5,
      activities: 500 * 5,
      transport: 100 * 5,
    });
  });

  it('每晚、每天的單價取到百位，小計剛好是單價乘天數', () => {
    const odd = destination({ id: 'odd', nightlyAccommodation: 1234 });

    const estimate = estimateTrip(odd, conditions({ vacationDays: 3 }));

    expect(estimate.breakdown.accommodation).toBe(1200 * 3);
  });
});

describe('minimumStayOf', () => {
  it.each([
    [3.9, 3],
    [4, 5],
    [10, 5],
    [10.1, 8],
  ])('單程 %s 小時至少要 %s 天', (flightHours, days) => {
    expect(minimumStayOf(destination({ id: 'x', flightHours }))).toBe(days);
  });
});

describe('planTrips', () => {
  it('把 Trip Cost 沒超過 Budget 的 Destination 標成 affordable', () => {
    const japan = destination({ id: 'JP' });

    // 10000 機票 + 2000×5 住宿 + 1000×5 每日三項 = 25000
    const [plan] = planTrips({ ...conditions(), budget: 100000 }, [japan]);

    expect(plan).toMatchObject({ tripCost: 25000, status: 'affordable', shortfall: 0 });
  });

  it('Trip Cost 恰好等於 Budget 時仍算 affordable', () => {
    const exact = destination({ id: 'exact' });

    const [plan] = planTrips({ ...conditions(), budget: 25000 }, [exact]);

    expect(plan?.status).toBe('affordable');
  });

  it('超過 Budget 的 Destination 標成 shortfall，並附上還差多少', () => {
    const over = destination({ id: 'over', flightCost: 90000 });

    // 90000 + 15000 = 105000，比 Budget 多 5000
    const [plan] = planTrips({ ...conditions(), budget: 100000 }, [over]);

    expect(plan).toMatchObject({ tripCost: 105000, status: 'shortfall', shortfall: 5000 });
  });

  it('去得起的全部排在去不起的前面', () => {
    const over = destination({ id: 'over', flightCost: 90000 });
    const within = destination({ id: 'within' });

    const plans = planTrips({ ...conditions(), budget: 100000 }, [over, within]);

    expect(ids(plans)).toEqual(['within', 'over']);
  });

  it('去得起的裡面，最接近 Budget 的排最前面', () => {
    const cheap = destination({ id: 'cheap', flightCost: 10000 });
    const mid = destination({ id: 'mid', flightCost: 30000 });
    const pricey = destination({ id: 'pricey', flightCost: 50000 });

    const plans = planTrips({ ...conditions(), budget: 100000 }, [cheap, pricey, mid]);

    expect(ids(plans)).toEqual(['pricey', 'mid', 'cheap']);
  });

  it('去不起的裡面，差最少的排最前面', () => {
    const far = destination({ id: 'far', flightCost: 60000 });
    const near = destination({ id: 'near', flightCost: 40000 });

    const plans = planTrips({ ...conditions(), budget: 30000 }, [far, near]);

    expect(ids(plans)).toEqual(['near', 'far']);
  });

  it('沒有任何地方去得起時，只回傳 shortfall', () => {
    const a = destination({ id: 'a' });
    const b = destination({ id: 'b', flightCost: 20000 });

    const plans = planTrips({ ...conditions(), budget: 1000 }, [a, b]);

    expect(plans.map((plan) => plan.status)).toEqual(['shortfall', 'shortfall']);
  });

  it('金額相同時依名稱排序，讓順序穩定', () => {
    const beta = destination({ id: 'beta', name: 'Beta' });
    const alpha = destination({ id: 'alpha', name: 'Alpha' });

    const plans = planTrips({ ...conditions(), budget: 100000 }, [beta, alpha]);

    expect(plans.map((plan) => plan.destination.name)).toEqual(['Alpha', 'Beta']);
  });

  it('假期少於 Minimum Stay 的 Destination 完全不出現', () => {
    const near = destination({ id: 'near', flightHours: 3 });
    const far = destination({ id: 'far', flightHours: 14 });

    const plans = planTrips({ ...conditions({ vacationDays: 5 }), budget: 1000000 }, [near, far]);

    expect(ids(plans)).toEqual(['near']);
  });

  it('假期剛好等於 Minimum Stay 時會出現', () => {
    const far = destination({ id: 'far', flightHours: 14 });

    const plans = planTrips({ ...conditions({ vacationDays: 8 }), budget: 1000000 }, [far]);

    expect(ids(plans)).toEqual(['far']);
  });

  it('所有 Destination 都因假期不足被排除時，回傳空陣列', () => {
    const near = destination({ id: 'near', flightHours: 3 });

    expect(planTrips({ ...conditions({ vacationDays: 2 }), budget: 1000000 }, [near])).toEqual([]);
  });

  it('沒有任何 Destination 時回傳空陣列', () => {
    expect(planTrips({ ...conditions(), budget: 100000 }, [])).toEqual([]);
  });
});

describe('estimateTrips', () => {
  it('還沒決定 Budget 時，列出假期夠去的地方，便宜的排前面', () => {
    const pricey = destination({ id: 'pricey', flightCost: 50000 });
    const cheap = destination({ id: 'cheap', flightCost: 10000 });
    const tooFar = destination({ id: 'tooFar', flightHours: 14 });

    const estimates = estimateTrips(conditions({ vacationDays: 5 }), [pricey, tooFar, cheap]);

    expect(ids(estimates)).toEqual(['cheap', 'pricey']);
  });
});
