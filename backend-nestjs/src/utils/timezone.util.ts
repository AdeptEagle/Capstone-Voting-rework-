/**
 * Utility functions for handling Philippine timezone (UTC+8) in the backend
 */

/**
 * Get current time in Philippine timezone
 * @returns {Date} Current time in Philippine timezone
 */
export const getPhilippineTime = (): Date => {
  const now = new Date();
  // Get the timezone offset for Asia/Manila (UTC+8)
  const philippineOffset = 8 * 60; // 8 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (philippineOffset * 60000));
};

/**
 * Convert a date to Philippine timezone
 * @param date - The date to convert
 * @returns Date in Philippine timezone
 */
export const toPhilippineTime = (date: Date): Date => {
  const philippineOffset = 8 * 60; // 8 hours in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (philippineOffset * 60000));
};

/**
 * Get a future date in Philippine timezone
 * @param minutesFromNow - Minutes to add to current time
 * @returns Future date in Philippine timezone
 */
export const getFuturePhilippineTime = (minutesFromNow: number = 1): Date => {
  const philippineTime = getPhilippineTime();
  return new Date(philippineTime.getTime() + minutesFromNow * 60000);
};

/**
 * Check if a date is in the future relative to Philippine time
 * @param date - The date to check
 * @param bufferMinutes - Buffer time in minutes (default: 1)
 * @returns True if the date is in the future
 */
export const isFuturePhilippineTime = (date: Date, bufferMinutes: number = 1): boolean => {
  const philippineTime = getPhilippineTime();
  const bufferTime = new Date(philippineTime.getTime() + bufferMinutes * 60000);
  return date >= bufferTime;
};