/**
 * Pluralization Utilities
 * Language-specific pluralization rules
 */

export { getRussianPlural } from './russian-plural';
export { getArabicPlural } from './arabic-plural';
export { getPolishPlural } from './polish-plural';
export { getCzechPlural } from './czech-plural';
export { getSpanishPlural } from './spanish-plural';
export { getRomanianPlural } from './romanian-plural';

// Additional pluralization functions that were missing
export function getTurkishPlural(n: number, forms: { singular: string; plural: string }): string {
  return n === 1 ? forms.singular : forms.plural;
}

export function getPortuguesePlural(n: number, forms: { singular: string; plural: string }): string {
  return n === 1 ? forms.singular : forms.plural;
}
