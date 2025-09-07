/**
 * Arabic Pluralization Rules
 * Handles Arabic plural forms with singular, dual, and plural
 */

/**
 * Gets the correct Arabic plural form for a number
 * Arabic has three number forms:
 * - Singular (1)
 * - Dual (2)
 * - Plural (3-10)
 * - Plural (11+)
 */
export function getArabicPlural(
  count: number,
  forms: {
    singular: string;
    dual: string;
    plural: string;
    pluralLarge?: string;
  }
): string {
  const absCount = Math.trunc(Math.abs(count));

  if (absCount === 0) return forms.plural;
  if (absCount === 1) return forms.singular;
  if (absCount === 2) return forms.dual;
  if (absCount >= 3 && absCount <= 10) return forms.plural;
  return forms.pluralLarge || forms.plural;
}
