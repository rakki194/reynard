/**
 * Spanish Pluralization Rules
 * Handles Spanish plural forms
 */

/**
 * Get the correct Spanish plural form based on quantity
 */
export function getSpanishPlural(count: number, forms: { singular: string; plural: string }): string {
  // Handle negative numbers and decimals by using absolute value and truncating
  const n = Math.abs(Math.trunc(count));

  // Spanish uses singular form only for exactly 1
  return n === 1 ? forms.singular : forms.plural;
}
