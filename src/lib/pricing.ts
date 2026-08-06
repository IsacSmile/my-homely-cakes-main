export function calculateWeightPrice(basePrice: number, baseWeightG: number, selectedWeightG: number): number {
  if (!baseWeightG || baseWeightG <= 0) return basePrice;
  // Calculate price proportional to weight (e.g. 500g base price 650 -> 1000g is 1300)
  const ratio = selectedWeightG / baseWeightG;
  return Math.round(basePrice * ratio);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
