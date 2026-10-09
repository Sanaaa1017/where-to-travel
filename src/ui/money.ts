const twd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'TWD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** 金額一律寫成「NT$48,000」。 */
export function formatTwd(value: number): string {
  return twd.format(value);
}

/** 只加千分位，給輸入欄在沒有聚焦時顯示用。 */
export function groupDigits(digits: string): string {
  return digits ? grouped.format(Number(digits)) : '';
}
