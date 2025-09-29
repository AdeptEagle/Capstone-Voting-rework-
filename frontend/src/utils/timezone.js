/**
 * Utility functions for handling Philippine timezone (UTC+8)
 */

/**
 * Get current time in Philippine timezone
 * @returns {Date} Current time in Philippine timezone
 */
export const getPhilippineTime = () => {
  const now = new Date();
  // Get the timezone offset for Asia/Manila (UTC+8)
  const philippineOffset = 8 * 60; // 8 hours in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (philippineOffset * 60000));
};

/**
 * Convert a date to Philippine timezone
 * @param {Date} date - The date to convert
 * @returns {Date} Date in Philippine timezone
 */
export const toPhilippineTime = (date) => {
  const philippineOffset = 8 * 60; // 8 hours in minutes
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + (philippineOffset * 60000));
};

/**
 * Get a future date in Philippine timezone
 * @param {number} minutesFromNow - Minutes to add to current time
 * @returns {Date} Future date in Philippine timezone
 */
export const getFuturePhilippineTime = (minutesFromNow = 1) => {
  const philippineTime = getPhilippineTime();
  return new Date(philippineTime.getTime() + minutesFromNow * 60000);
};

/**
 * Format date for datetime-local input (YYYY-MM-DDTHH:MM) in local timezone
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatForDateTimeLocal = (date) => {
  // Format the date in local timezone, not UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get default start and end dates for ballot creation
 * @returns {Object} Object with startDate and endDate formatted for datetime-local input
 */
export const getDefaultBallotDates = () => {
  const startDate = getFuturePhilippineTime(5); // 5 minutes from now to ensure validation passes
  const endDate = getFuturePhilippineTime(24 * 60); // 24 hours from now
  
  // Debug logging
  console.log('🕐 Timezone Debug:');
  console.log('Current local time:', new Date().toLocaleString());
  console.log('Philippine time:', getPhilippineTime().toLocaleString());
  console.log('Start date (Philippine):', startDate.toLocaleString());
  console.log('Formatted start date:', formatForDateTimeLocal(startDate));
  console.log('Start date hours:', startDate.getHours(), 'minutes:', startDate.getMinutes());
  
  return {
    startDate: formatForDateTimeLocal(startDate),
    endDate: formatForDateTimeLocal(endDate)
  };
};
