/**
 * Russian Pluralization Rules
 * Handles complex Russian plural forms
 */

/**
 * Gets the correct Russian plural form based on number
 * @param num The number to get plural form for
 * @param forms Array of [singular, few, many] forms
 * @returns The correct plural form
 */
export function getRussianPlural(num: number, forms: [string, string, string]): string {
  // Truncate decimal numbers to integers
  const n = Math.trunc(Math.abs(num));
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return forms[2]; // many
  }

  if (lastDigit === 1) {
    return forms[0]; // singular
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1]; // few
  }

  return forms[2]; // many
}
