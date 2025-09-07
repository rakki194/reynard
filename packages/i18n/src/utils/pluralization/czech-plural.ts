/**
 * Czech Pluralization Rules
 * Handles Czech plural forms
 */

/**
 * Gets the correct Czech plural form based on the number
 * Czech has 3 plural forms:
 * 1. Singular (1): soubor
 * 2. Plural for 2-4: soubory
 * 3. Plural for 0, 5+: souborů
 */
export function getCzechPlural(
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

  // Singular case (1, but not 11)
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return forms.singular;
  }

  // 2-4 case (but not 12-14)
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return forms.plural2_4;
  }

  // All other cases (0, 5-9, teens)
  return forms.plural5_;
}
