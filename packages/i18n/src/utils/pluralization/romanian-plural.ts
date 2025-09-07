/**
 * Romanian Pluralization Rules
 * Handles Romanian plural forms
 */

/**
 * Gets the correct plural form for Romanian based on count.
 * Romanian has three forms:
 * - Singular (1): carte
 * - Few (2-19): cărți
 * - Many (20+): de cărți
 */
export function getRomanianPlural(count: number, forms: { one: string; few: string; many: string }): string {
  const absCount = Math.abs(count);

  // Handle zero
  if (count === 0) {
    return forms.few;
  }

  // Handle exact 1
  if (absCount === 1 && Number.isInteger(count)) {
    return forms.one;
  }

  // Handle numbers >= 20 (including decimals)
  if (absCount >= 20) {
    return forms.many;
  }

  // All other cases (2-19 and decimals < 20)
  return forms.few;
}
