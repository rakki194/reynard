/**
 * Polish Pluralization Rules
 * Handles Polish plural forms with complex rules
 */

/**
 * Gets the correct Polish plural form based on the number
 * Polish has 3 plural forms:
 * 1. Singular (1)
 * 2. Plural for 2-4 (except 12-14)
 * 3. Plural for 0, 5-21, and numbers ending in 5-9
 */
export function getPolishPlural(
  count: number,
  forms: {
    singular: string;
    plural2_4: string;
    plural5_: string;
  }
): string {
  // Get absolute value and last digit
  const absCount = Math.abs(Math.floor(count));
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  // Special case for teens (12-14)
  if (lastTwoDigits > 11 && lastTwoDigits < 15) {
    return forms.plural5_;
  }

  // Singular case
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return forms.singular;
  }

  // 2-4 case (except 12-14)
  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms.plural2_4;
  }

  // All other cases (0, 5-9, teens)
  return forms.plural5_;
}
