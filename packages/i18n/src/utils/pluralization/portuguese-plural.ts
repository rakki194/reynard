/**
 * Portuguese Pluralization Rules
 * Handles Portuguese plural forms with complex rules
 */

/**
 * Determines the correct Portuguese plural form based on number
 *
 * Portuguese plural rules:
 * - Words ending in -ão have three possible plural forms:
 *   - -ões (most common): leão → leões
 *   - -ães: cão → cães
 *   - -ãos: mão → mãos
 * - Words ending in -al, -el, -ol, -ul: remove -l and add -is
 *   - animal → animais
 *   - papel → papéis
 * - Words ending in -il:
 *   - Stressed: remove -il and add -is (fuzil → fuzis)
 *   - Unstressed: remove -l and add -eis (fácil → fáceis)
 * - Words ending in -m: change -m to -ns
 *   - jovem → jovens
 */
export function getPortuguesePlural(
  num: number,
  forms: {
    singular: string;
    plural: string;
    pluralAlt?: string; // For words with alternative plural forms
  }
): string {
  // Handle zero case
  if (num === 0) return forms.plural;

  // Handle singular case
  if (Math.abs(num) === 1) return forms.singular;

  // Handle special plural cases if alternative form exists
  if (forms.pluralAlt && /ão$/.test(forms.singular)) {
    // For numbers above 10, use alternative plural form if available
    if (Math.abs(num) > 10) return forms.pluralAlt;
  }

  // Default plural form
  return forms.plural;
}
