import type { Demand, Destination, Season } from '../domain/types';

/**
 * 台灣旅客常去、以及全世界熱門的 42 個 Destination。
 *
 * ⚠️ 這些數字是「未經查證的估算」，不是查來的。
 * 目前沒有免費且可自由散布的各國旅遊花費資料集（Numbeo、Budget Your Trip
 * 限制再散布，公開的歷史票價資料則不存在），因此直接以既有知識填寫，
 * 準確度目標僅為「量級正確」。
 *
 * 產生日期：2026-07-27（亞洲 4 國），2026-10-09（擴充到 42 個並拆分每日花費、加上淡旺季）
 *
 * 若這個產品要公開給真人使用，這些數字必須先換成人工查證過的版本。
 *
 * 金額單位一律 TWD，以單人、經濟艙、中價位住宿、平季為基準。
 * 飛行時數是從台北出發的典型單程時間；沒有直飛的地方含一次轉機。
 * 淡旺季以台灣的月份劃分季節（春 3–5、夏 6–8、秋 9–11、冬 12–2），南半球也一樣。
 */

type Row = [
  id: string,
  name: string,
  flightCost: number,
  nightlyAccommodation: number,
  dailyFood: number,
  dailyActivities: number,
  dailyTransport: number,
  flightHours: number,
  seasons: SeasonCode,
];

/** 春夏秋冬依序各一個字母：L 淡季、S 平季、P 旺季。例如 'PSPL'。 */
type SeasonCode = string;

const DEMAND: Record<string, Demand> = { L: 'low', S: 'shoulder', P: 'peak' };
const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// prettier-ignore
const rows: Row[] = [
  // 東亞
  ['JP', 'Japan',          13000, 3000, 1200,  500,  300,  3,    'PSPL'],
  ['KR', 'South Korea',    10000, 2500, 1000,  500,  300,  2.5,  'PSPL'],
  ['HK', 'Hong Kong',       7000, 4000, 1200,  600,  300,  1.75, 'SLPP'],
  // 東南亞
  ['TH', 'Thailand',       11000, 1800,  600,  400,  200,  3.5,  'SLSP'],
  ['VN', 'Vietnam',         9000, 1500,  500,  300,  200,  3,    'PSLS'],
  ['SG', 'Singapore',      11000, 5000, 1200, 1000,  300,  4.5,  'SPLS'],
  ['MY', 'Malaysia',       10000, 1800,  600,  400,  200,  4.5,  'SPLS'],
  ['PH', 'Philippines',     8000, 1800,  600,  500,  250,  2,    'PLLS'],
  ['ID', 'Indonesia',      15000, 2000,  600,  500,  300,  5,    'SPSL'],
  ['KH', 'Cambodia',       12000, 1300,  500,  600,  250,  3.5,  'SLLP'],
  // 南亞
  ['IN', 'India',          22000, 2000,  500,  500,  300,  6.5,  'SLSP'],
  ['NP', 'Nepal',          25000, 1500,  500,  600,  300,  9,    'PLPS'],
  ['LK', 'Sri Lanka',      25000, 2000,  600,  600,  400,  9,    'SSLP'],
  // 中東
  ['AE', 'United Arab Emirates', 28000, 4500, 1500, 1200, 500, 9.5, 'SLSP'],
  ['TR', 'Turkey',         30000, 2500,  900,  800,  400, 13,    'SPSL'],
  ['JO', 'Jordan',         35000, 3000, 1000, 1500,  600, 14,    'PLPL'],
  // 非洲
  ['EG', 'Egypt',          32000, 2200,  700, 1200,  400, 14,    'SLSP'],
  ['MA', 'Morocco',        40000, 2500,  800,  800,  400, 17,    'PSPL'],
  ['ZA', 'South Africa',   40000, 3000,  900, 1000,  800, 17,    'SSSP'],
  ['KE', 'Kenya',          45000, 4000,  900, 3000,  600, 16,    'LPSS'],
  // 歐洲
  ['GB', 'United Kingdom', 38000, 5500, 1600, 1000,  600, 14.5,  'SPSL'],
  ['FR', 'France',         36000, 5000, 1600,  900,  500, 14,    'SPSL'],
  ['IT', 'Italy',          36000, 4200, 1400,  900,  500, 14,    'SPSL'],
  ['ES', 'Spain',          37000, 3800, 1300,  800,  400, 16,    'SPSL'],
  ['DE', 'Germany',        34000, 4000, 1300,  700,  500, 14,    'SPSS'],
  ['CH', 'Switzerland',    38000, 6500, 2200, 1200, 1200, 15,    'SPSS'],
  ['NL', 'Netherlands',    35000, 5000, 1500,  900,  400, 14,    'PPSL'],
  ['AT', 'Austria',        36000, 4000, 1400,  800,  400, 14,    'SPSS'],
  ['CZ', 'Czechia',        33000, 3000, 1000,  600,  300, 14,    'SPSS'],
  ['GR', 'Greece',         40000, 3800, 1200,  800,  400, 16,    'SPSL'],
  ['PT', 'Portugal',       40000, 3200, 1100,  700,  400, 17,    'SPSL'],
  ['HR', 'Croatia',        40000, 3500, 1100,  700,  400, 17,    'SPSL'],
  ['IS', 'Iceland',        50000, 6000, 2000, 2000, 1500, 18,    'LPSS'],
  ['NO', 'Norway',         45000, 5500, 2000, 1200,  800, 17,    'SPSS'],
  // 美洲
  ['US', 'United States',  35000, 5500, 1800, 1200,  800, 12,    'SPSL'],
  ['CA', 'Canada',         33000, 4500, 1500, 1000,  700, 11.5,  'LPSS'],
  ['MX', 'Mexico',         40000, 3000, 1000,  800,  400, 18,    'SLLP'],
  ['PE', 'Peru',           50000, 2500,  900, 1500,  500, 24,    'SPSL'],
  ['BR', 'Brazil',         50000, 3000, 1000,  800,  500, 26,    'SLSP'],
  ['AR', 'Argentina',      55000, 2500, 1000,  800,  500, 28,    'SLSP'],
  // 大洋洲
  ['AU', 'Australia',      28000, 4500, 1600, 1000,  600,  9,    'SLSP'],
  ['NZ', 'New Zealand',    35000, 4000, 1500, 1200, 1000, 11,    'SLSP'],
];

export const destinations: Destination[] = rows.map(
  ([
    id,
    name,
    flightCost,
    nightlyAccommodation,
    dailyFood,
    dailyActivities,
    dailyTransport,
    flightHours,
    seasons,
  ]) => ({
    id,
    name,
    flightCost,
    nightlyAccommodation,
    dailyFood,
    dailyActivities,
    dailyTransport,
    flightHours,
    // 代碼打錯時這裡會得到 undefined，由資料完整性測試抓出來，不在這裡默默補成平季。
    seasons: Object.fromEntries(
      SEASON_ORDER.map((season, index) => [season, DEMAND[seasons.charAt(index)]]),
    ) as Record<Season, Demand>,
  }),
);
