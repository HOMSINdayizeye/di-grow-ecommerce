/**
 * Format a number as Rwandan Francs. RWF has no minor units, so we round.
 * formatCurrency(12500) -> "RWF 12,500"
 */
export function formatCurrency(amount, { compact = false } = {}) {
  const value = Number(amount) || 0;
  if (compact && Math.abs(value) >= 1_000_000) {
    return `RWF ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `RWF ${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `RWF ${Math.round(value).toLocaleString('en-RW')}`;
}

export default formatCurrency;
