import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function calculateROI(revenue: number, spend: number): number {
  if (spend === 0) return 0
  return (revenue - spend) / spend
}

export function calculateMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0
  return (revenue - cost) / revenue
}

export function calculateLift(promoted: number, baseline: number): number {
  if (baseline === 0) return 0
  return (promoted - baseline) / baseline
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getFiscalYear(date: Date, fiscalStartMonth = 0): number {
  const year = date.getFullYear()
  const month = date.getMonth()
  return month >= fiscalStartMonth ? year + 1 : year
}

export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

