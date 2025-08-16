import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a Firestore Timestamp or date string to a JavaScript Date object
 * @param timestamp - Firestore Timestamp object, date string, or Date object
 * @returns Date object or null if conversion fails
 */
export function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  try {
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If it's a Firestore Timestamp (has toDate method)
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's a Firestore Timestamp (has seconds property)
    if (timestamp.seconds && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    
    // Try to parse as string or number
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (e) {
    console.error('Error converting timestamp to date:', e, timestamp);
    return null;
  }
} 