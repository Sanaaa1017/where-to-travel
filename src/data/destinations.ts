import type { Destination } from '../domain/types';

/**
 * 種子資料，票 02 用來讓畫面有東西可看。票 05 會擴充到 20 國。
 *
 * ⚠️ 這些數字是「未經查證的估算」，不是查來的。
 * 目前沒有免費且可自由散布的各國旅遊花費資料集（Numbeo、Budget Your Trip
 * 限制再散布，公開的歷史票價資料則不存在），因此第一版直接以既有知識填寫，
 * 準確度目標僅為「量級正確」。
 *
 * 產生日期：2026-07-27
 *
 * 若這個產品要公開給真人使用，這些數字必須先換成人工查證過的版本。
 *
 * 金額單位一律 TWD，以單人、經濟艙、中價位住宿為基準。
 */
export const destinations: Destination[] = [
  {
    id: 'JP',
    name: '日本',
    flightCost: 13000,
    nightlyAccommodation: 3000,
    dailySpend: 2000,
    flightHours: 3,
  },
  {
    id: 'KR',
    name: '韓國',
    flightCost: 10000,
    nightlyAccommodation: 2500,
    dailySpend: 1800,
    flightHours: 2.5,
  },
  {
    id: 'TH',
    name: '泰國',
    flightCost: 11000,
    nightlyAccommodation: 1800,
    dailySpend: 1200,
    flightHours: 3.5,
  },
  {
    id: 'VN',
    name: '越南',
    flightCost: 9000,
    nightlyAccommodation: 1500,
    dailySpend: 1000,
    flightHours: 3,
  },
];
