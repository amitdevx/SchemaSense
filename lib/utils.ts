import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const IST_OPTIONS = { timeZone: 'Asia/Kolkata' } as const

/** Format a Date or ISO string to IST date+time string */
export function formatIST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-IN', { ...IST_OPTIONS, hour12: true })
}

/** Format to IST time only (HH:MM AM/PM) */
export function formatISTTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-IN', { ...IST_OPTIONS, hour: '2-digit', minute: '2-digit', hour12: true })
}

/** Format to IST date only */
export function formatISTDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { ...IST_OPTIONS, day: 'numeric', month: 'short', year: 'numeric' })
}
