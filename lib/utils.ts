import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts a value to a number, returning 0 if the value is undefined, null, or NaN
 */
export function safeNumber(value: any): number {
  if (value === undefined || value === null) return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

/**
 * Safely converts a value to a string, returning "0" if the value is undefined or null
 */
export function safeString(value: any): string {
  if (value === undefined || value === null) return "0"
  return String(value)
}
