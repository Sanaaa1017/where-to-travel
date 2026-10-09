const amount = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 });

/** 金額一律寫成「38,000 元」，跟輸入的那句「我有 80000 元」用同一個說法。 */
export function formatTwd(value: number): string {
  return `${amount.format(value)} 元`;
}
