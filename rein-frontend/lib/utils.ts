import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO date string (YYYY-MM-DD) to readable format
 * @param dateStr ISO date string or undefined
 * @returns Formatted date like "Jan 15" or "Tomorrow" or undefined
 */
export function formatScheduledDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;

  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time part for accurate comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  // Check if it's today or tomorrow
  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  // Format as "Jan 15" or "Jan 15, 2025" if not current year
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  if (year === today.getFullYear()) {
    return `${month} ${day}`;
  } else {
    return `${month} ${day}, ${year}`;
  }
}
