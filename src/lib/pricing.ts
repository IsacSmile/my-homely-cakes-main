export interface WeightVariant {
  weightG: number;
  price: number;
  isDefault?: boolean;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Safely parse structured variants from a product object.
 * Returns array of { weightG, price, isDefault }.
 */
export function parseProductVariants(product: any): WeightVariant[] {
  if (!product) return [{ weightG: 500, price: 650, isDefault: true }];

  try {
    const raw = product.variants;
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Handle array of objects [{ weightG: 500, price: 650 }] or legacy numbers [500, 1000]
        const formatted: WeightVariant[] = parsed.map((item: any, idx: number) => {
          if (typeof item === 'number') {
            const baseW = product.baseWeightG || 500;
            const baseP = product.basePrice || 650;
            const calcP = Math.round((baseP * item) / baseW);
            return {
              weightG: item,
              price: calcP,
              isDefault: idx === 0,
            };
          }
          return {
            weightG: Number(item.weightG || item.weight_g || 500),
            price: Number(item.price || 650),
            isDefault: Boolean(item.isDefault || item.is_default || idx === 0),
          };
        });

        return formatted.sort((a, b) => a.weightG - b.weightG);
      }
    }
  } catch (e) {
    console.error('Error parsing product variants:', e);
  }

  // Fallback if no variants array
  const baseW = product.baseWeightG || 500;
  const baseP = product.basePrice || 650;
  return [{ weightG: baseW, price: baseP, isDefault: true }];
}

/**
 * Get lowest-priced variant for "Starts at" card display.
 */
export function getLowestVariant(product: any): WeightVariant {
  const list = parseProductVariants(product);
  return list.reduce((lowest, curr) => (curr.price < lowest.price ? curr : lowest), list[0]);
}

/**
 * Get default variant to pre-select on product detail modal.
 */
export function getDefaultVariant(product: any): WeightVariant {
  const list = parseProductVariants(product);
  const found = list.find(v => v.isDefault);
  return found || list[0];
}

/**
 * Get exact admin price for selected weight option.
 */
export function getVariantPrice(product: any, selectedWeightG: number): number {
  const list = parseProductVariants(product);
  const exact = list.find(v => v.weightG === selectedWeightG);
  if (exact) return exact.price;

  // Fallback to default or lowest if exact weight is missing
  const def = getDefaultVariant(product);
  return def.price;
}

/**
 * Legacy support calculation (fallback).
 */
export function calculateWeightPrice(basePrice: number, baseWeightG: number, selectedWeightG: number): number {
  if (!baseWeightG || baseWeightG <= 0) return basePrice;
  return Math.round((basePrice * selectedWeightG) / baseWeightG);
}
