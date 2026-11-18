import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/**
 * Formats minor-unit NGN kobo as a Nigerian Naira string (e.g. 68000000 -> ₦680,000).
 */
export function formatNaira(minorUnits: number): string {
  const safeMinor = Number.isFinite(minorUnits) ? minorUnits : 0;
  const naira = safeMinor / 100;
  const hasKobo = Math.round(safeMinor) % 100 !== 0;
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: hasKobo ? 2 : 0,
    maximumFractionDigits: hasKobo ? 2 : 0,
  })}`;
}

export function koboToNaira(minorUnits: number | null | undefined): number {
  if (minorUnits == null || !Number.isFinite(minorUnits)) return 0;
  return minorUnits / 100;
}

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) return 0;
  return Math.round(naira * 100);
}

export function getEffectiveUnitPrice(
  product: {
    price: number;
    retail_price?: number | null;
    is_flash_sale?: boolean;
  },
  salesMode: 'consumer' | 'retail' | null | undefined
): number {
  if (salesMode === 'retail') {
    const retailBase = product.retail_price ?? product.price;
    return product.is_flash_sale ? Math.min(product.price, retailBase) : retailBase;
  }
  return product.price;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}
