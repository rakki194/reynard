/**
 * Formatting Utilities
 * Comprehensive formatting functions for data display
 */

/**
 * Formats a file size from bytes into a human-readable string with appropriate units.
 *
 * @param bytes - The file size in bytes to format
 * @returns A string representing the file size with units (e.g. "1.5 MB")
 *
 * @example
 * formatFileSize(1500) // Returns "1.5 KB"
 * formatFileSize(1500000) // Returns "1.4 MB"
 */
export function formatFileSize(bytes: number): string {
  // Handle edge cases
  if (typeof bytes !== 'number' || !isFinite(bytes)) {
    return "0 B";
  }

  if (bytes === 0) return "0 B";

  // Handle extremely large numbers
  if (bytes > Number.MAX_SAFE_INTEGER) {
    return "> 1 PB";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = Math.abs(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Prevent precision issues with very small numbers
  if (size < 0.1 && unitIndex > 0) {
    size = Math.round(size * 1000) / 1000;
  }

  const formatted = unitIndex === 0 ? Math.round(size).toString() : size.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Formats bytes into a human-readable string with appropriate units and custom precision.
 *
 * @param bytes - The file size in bytes to format
 * @param precision - Number of decimal places to show (defaults to 1)
 * @returns A string representing the file size with units (e.g. "1.5 KB")
 *
 * @example
 * formatBytes(1500) // Returns "1.5 KB"
 * formatBytes(1500, 2) // Returns "1.46 KB"
 * formatBytes(1024, 0) // Returns "1 KB"
 */
export function formatBytes(bytes: number, precision: number = 1): string {
  // Handle edge cases
  if (typeof bytes !== 'number' || !isFinite(bytes)) {
    return "0 B";
  }

  if (typeof precision !== 'number' || !isFinite(precision) || precision < 0 || precision > 10) {
    precision = 1;
  }

  if (bytes === 0) return "0 B";

  // Handle extremely large numbers
  if (bytes > Number.MAX_SAFE_INTEGER) {
    return "> 1 PB";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = Math.abs(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Prevent precision issues with very small numbers
  if (size < 0.1 && unitIndex > 0) {
    size = Math.round(size * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  const formatted = unitIndex === 0 ? Math.round(size).toString() : size.toFixed(precision);
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Formats a date/time value into a human-readable string.
 *
 * @param date - The date to format (Date object, timestamp, or ISO string)
 * @returns A string representing the formatted date/time
 *
 * @example
 * formatDateTime(new Date()) // Returns "2024-01-01 12:00:00"
 * formatDateTime(1704067200000) // Returns "2024-01-01 12:00:00"
 */
export function formatDateTime(date: Date | number | string): string {
  // Handle null/undefined input
  if (date == null) {
    return "Invalid Date";
  }

  let dateObj: Date;

  if (typeof date === "number") {
    // Validate timestamp
    if (!isFinite(date) || date < 0) {
      return "Invalid Date";
    }
    dateObj = new Date(date);
  } else if (typeof date === "string") {
    // Validate string input
    if (date.trim() === "") {
      return "Invalid Date";
    }
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return "Invalid Date";
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return dateObj.toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Formats a number with thousand separators
 *
 * @param num - The number to format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns A string with formatted number
 *
 * @example
 * formatNumber(1234567) // Returns "1,234,567"
 * formatNumber(1234567, 'de-DE') // Returns "1.234.567"
 */
export function formatNumber(num: number, locale: string = "en-US"): string {
  // Handle edge cases
  if (typeof num !== 'number' || !isFinite(num)) {
    return "0";
  }

  if (typeof locale !== 'string' || locale.trim() === '') {
    locale = "en-US";
  }

  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch (error) {
    // Fallback to default locale if provided locale is invalid
    return new Intl.NumberFormat("en-US").format(num);
  }
}

/**
 * Formats a number as currency
 *
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @param locale - The locale to use for formatting
 * @returns A string with formatted currency
 *
 * @example
 * formatCurrency(1234.56, 'USD') // Returns "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE') // Returns "1.234,56 €"
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a percentage with specified decimal places
 *
 * @param value - The decimal value (0.5 = 50%)
 * @param decimals - Number of decimal places to show
 * @returns A string with formatted percentage
 *
 * @example
 * formatPercentage(0.1234) // Returns "12.34%"
 * formatPercentage(0.1234, 1) // Returns "12.3%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Truncates text to a specified length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (defaults to '...')
 * @returns Truncated string
 *
 * @example
 * truncateText("Hello world!", 5) // Returns "Hello..."
 * truncateText("Hello world!", 5, "…") // Returns "Hello…"
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (text.length <= maxLength) return text;
  // Truncate to maxLength, where maxLength includes the suffix
  // So we need to leave space for the suffix
  const truncatedLength = maxLength - suffix.length;
  if (truncatedLength <= 0) return suffix;
  return text.substring(0, truncatedLength) + suffix;
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 *
 * @example
 * capitalize("hello world") // Returns "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a camelCase string to kebab-case
 *
 * @param str - The camelCase string
 * @returns kebab-case string
 *
 * @example
 * camelToKebab("backgroundColor") // Returns "background-color"
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Converts a kebab-case string to camelCase
 *
 * @param str - The kebab-case string
 * @returns camelCase string
 *
 * @example
 * kebabToCamel("background-color") // Returns "backgroundColor"
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Pluralizes a word based on count
 *
 * @param count - The count to determine plural
 * @param singular - The singular form
 * @param plural - The plural form (optional, defaults to singular + 's')
 * @returns The appropriate form based on count
 *
 * @example
 * pluralize(1, "item") // Returns "1 item"
 * pluralize(2, "item") // Returns "2 items"
 * pluralize(2, "child", "children") // Returns "2 children"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}
