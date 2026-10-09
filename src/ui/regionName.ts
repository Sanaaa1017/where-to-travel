const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

/**
 * 用 ISO 代碼取得英文國名。地球輪廓資料只附繁中名稱，
 * 沒有 Destination 的國家（例如滑過俄羅斯）靠這個顯示英文。
 * Natural Earth 把台灣標成 'CN-TW'，這裡當成 'TW'。
 */
export function regionName(iso: string, fallback: string): string {
  try {
    return displayNames.of(iso === 'CN-TW' ? 'TW' : iso) ?? fallback;
  } catch {
    return fallback;
  }
}
