import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID for pieces
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a number to 2 decimal places
 */
export function formatNumber(value: number): string {
  return value.toFixed(2);
}

/**
 * Validate dimension input
 */
export function isValidDimension(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num <= 10000;
}

/**
 * Validate quantity input
 */
export function isValidQuantity(value: string): boolean {
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && num <= 1000;
}

/**
 * Convert dimensions to different units
 */
export function convertDimension(value: number, fromUnit: string, toUnit: string): number {
  const mmToInch = 0.0393701;
  const mmToCm = 0.1;

  if (fromUnit === toUnit) return value;

  let valueInMm = value;
  if (fromUnit === 'inch') valueInMm = value / mmToInch;
  if (fromUnit === 'cm') valueInMm = value / mmToCm;

  if (toUnit === 'inch') return valueInMm * mmToInch;
  if (toUnit === 'cm') return valueInMm * mmToCm;

  return valueInMm;
}
