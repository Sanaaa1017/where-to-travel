import type { CostBreakdown, Season, SpendLevel, TravelStyle } from '../domain/types';

export const SEASONS: { value: Season; label: string; months: string }[] = [
  { value: 'spring', label: 'Spring', months: 'Mar–May' },
  { value: 'summer', label: 'Summer', months: 'Jun–Aug' },
  { value: 'autumn', label: 'Autumn', months: 'Sep–Nov' },
  { value: 'winter', label: 'Winter', months: 'Dec–Feb' },
];

export function seasonLabel(season: Season): string {
  return SEASONS.find((option) => option.value === season)?.label ?? season;
}

/** 住宿、餐飲、玩樂各自的三個程度，用 Traveler 聽得懂的說法。 */
export const LEVEL_LABELS: Record<keyof TravelStyle, Record<SpendLevel, string>> = {
  stay: { save: 'Hostel', standard: 'Hotel', splurge: 'Upscale' },
  food: { save: 'Street food', standard: 'Casual', splurge: 'Fine dining' },
  activities: { save: 'Easy', standard: 'Balanced', splurge: 'Packed' },
};

/** 不是一般程度時，在清單上方提醒 Traveler 價格是照什麼假設算的。 */
const STYLE_PHRASES: Record<keyof TravelStyle, Partial<Record<SpendLevel, string>>> = {
  stay: { save: 'hostels', splurge: 'upscale hotels' },
  food: { save: 'street food', splurge: 'fine dining' },
  activities: { save: 'an easy pace', splurge: 'a packed schedule' },
};

export function assumptionsOf(season: Season | null, style: TravelStyle): string[] {
  const phrases = season ? [`${seasonLabel(season).toLowerCase()} travel`] : [];
  for (const key of ['stay', 'food', 'activities'] as const) {
    const phrase = STYLE_PHRASES[key][style[key]];
    if (phrase) phrases.push(phrase);
  }
  return phrases;
}

/** 明細五項的順序與顏色。顏色順序經過色盲安全檢查，相鄰兩項一定分得開，不要調換。 */
export const CATEGORIES: { key: keyof CostBreakdown; label: string; color: string }[] = [
  { key: 'flight', label: 'Flights', color: '#3987e5' },
  { key: 'accommodation', label: 'Stay', color: '#199e70' },
  { key: 'food', label: 'Food', color: '#9085e9' },
  { key: 'activities', label: 'Activities', color: '#d55181' },
  { key: 'transport', label: 'Getting around', color: '#008300' },
];

export function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
