/**
 * Utility functions for Reynard i18n system
 * Enhanced with Yipyap's sophisticated language-specific features
 */

import type { LanguageCode, Language, TranslationParams } from './types';

// Supported languages with metadata
export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nb', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
];

// Helper function to get the path separator based on locale and platform
export function getPathSeparator(locale: LanguageCode): string {
  if (locale === 'ja') return '￥';
  return navigator.userAgent.toLowerCase().includes('win') ? ' \\ ' : ' / ';
}

// Helper function to get nested translation values with type safety
export function getTranslationValue(
  obj: Record<string, unknown>,
  path: string,
  params?: TranslationParams
): string {
  const value = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
  
  if (typeof value === 'function') {
    return (value as (params: TranslationParams) => string)(params || {});
  }
  
  if (typeof value === 'string' && params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(`{${key}}`, val?.toString() || ''),
      value
    );
  }
  
  return (typeof value === 'string' ? value : '') || path;
}

// Get language by code
export function getLanguage(code: LanguageCode): Language | undefined {
  return languages.find((lang) => lang.code === code);
}

// Check if language is RTL
export function isRTL(locale: LanguageCode): boolean {
  const language = getLanguage(locale);
  return language?.rtl || false;
}

// Get browser locale
export function getBrowserLocale(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  if (!browserLang) return 'en';
  
  const langCode = browserLang.split('-')[0] as LanguageCode;

  // Check if we support this language
  if (languages.some((lang) => lang.code === langCode)) {
    return langCode;
  }

  // Check for full locale (e.g., pt-BR)
  if (languages.some((lang) => lang.code === browserLang)) {
    return browserLang as LanguageCode;
  }

  return 'en'; // Default fallback
}

// Get initial locale from localStorage or browser
export function getInitialLocale(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('reynard-locale') as LanguageCode;
  if (stored && languages.some((lang) => lang.code === stored)) {
    return stored;
  }
  
  return getBrowserLocale();
}

// Format number according to locale
export function formatNumber(value: number, locale: LanguageCode): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return value.toString();
  }
}

// Format date according to locale
export function formatDate(date: Date, locale: LanguageCode, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// Format currency according to locale
export function formatCurrency(value: number, locale: LanguageCode, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

// Validate language code
export function isValidLanguageCode(code: string): code is LanguageCode {
  return languages.some((lang) => lang.code === code);
}

// Get language name in native script
export function getNativeLanguageName(code: LanguageCode): string {
  const language = getLanguage(code);
  return language?.nativeName || language?.name || code;
}

// Get language name in English
export function getEnglishLanguageName(code: LanguageCode): string {
  const language = getLanguage(code);
  return language?.name || code;
}

// Check if locale has complex pluralization
export function hasComplexPluralization(locale: LanguageCode): boolean {
  const complexPluralLanguages: LanguageCode[] = ['ar', 'ru', 'uk', 'pl', 'cs', 'bg', 'ro'];
  return complexPluralLanguages.includes(locale);
}

// Get pluralization categories for a locale
export function getPluralizationCategories(locale: LanguageCode): string[] {
  switch (locale) {
    case 'ar':
      return ['zero', 'one', 'two', 'few', 'many', 'other'];
    case 'ru':
    case 'uk':
    case 'pl':
    case 'cs':
    case 'bg':
      return ['one', 'few', 'many'];
    case 'ro':
      return ['one', 'few', 'many'];
    default:
      return ['one', 'other'];
  }
}

// ============================================================================
// ADVANCED PLURALIZATION RULES (from Yipyap)
// ============================================================================

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

/**
 * Get the correct Spanish plural form based on quantity
 */
export function getSpanishPlural(count: number, forms: { singular: string; plural: string }): string {
  // Handle negative numbers and decimals by using absolute value and truncating
  const n = Math.abs(Math.trunc(count));

  // Spanish uses singular form only for exactly 1
  return n === 1 ? forms.singular : forms.plural;
}

/**
 * Gets the correct Turkish plural form based on vowel harmony rules
 * Turkish has two plural suffixes: -lar and -ler
 * The choice depends on the last vowel in the word:
 * - Back vowels (a, ı, o, u) take -lar
 * - Front vowels (e, i, ö, ü) take -ler
 */
export function getTurkishPlural(
  word: string,
  forms: {
    singular: string;
    pluralLar: string; // for back vowels
    pluralLer: string; // for front vowels
  }
): string {
  // Back vowels: a, ı, o, u
  const backVowels = ['a', 'ı', 'o', 'u'];
  // Front vowels: e, i, ö, ü
  const frontVowels = ['e', 'i', 'ö', 'ü'];

  // Find the last vowel in the word
  const letters = word.toLowerCase().split('');
  for (let i = letters.length - 1; i >= 0; i--) {
    if (backVowels.includes(letters[i])) {
      return forms.pluralLar;
    }
    if (frontVowels.includes(letters[i])) {
      return forms.pluralLer;
    }
  }

  // Default to -ler if no vowels found
  return forms.pluralLer;
}

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

// ============================================================================
// GRAMMAR HELPERS (from Yipyap)
// ============================================================================

/**
 * Determines if a Hungarian word should be prefaced with "a" or "az"
 * Based on Hungarian grammar rules:
 * - Use "az" before words starting with vowels (a, e, i, o, ö, u, ü, á, é, í, ó, ő, ú, ű)
 * - Use "a" before words starting with consonants
 */
const HUNGARIAN_NUMBERS: { [key: number]: string } = {
  0: 'nulla',
  1: 'egy',
  2: 'kettő',
  3: 'három',
  4: 'négy',
  5: 'öt',
  6: 'hat',
  7: 'hét',
  8: 'nyolc',
  9: 'kilenc',
  10: 'tíz',
  20: 'húsz',
  30: 'harminc',
  40: 'negyven',
  50: 'ötven',
  60: 'hatvan',
  70: 'hetven',
  80: 'nyolcvan',
  90: 'kilencven',
  100: 'száz',
  1000: 'ezer',
  1000000: 'millió',
  1000000000: 'milliárd',
};

const VOWELS = new Set(['a', 'á', 'e', 'é', 'i', 'í', 'o', 'ó', 'ö', 'ő', 'u', 'ú', 'ü', 'ű']);

function startsWithVowel(word: string): boolean {
  return VOWELS.has(word.toLowerCase().charAt(0));
}

/**
 * Converts a number to its Hungarian word representation
 */
function convertNumberToHungarianWord(num: number): string {
  // Handle special cases first
  if (num === 0) return HUNGARIAN_NUMBERS[0];
  if (Math.abs(num) in HUNGARIAN_NUMBERS) return HUNGARIAN_NUMBERS[Math.abs(num)];

  // Handle negative numbers
  if (num < 0) return `mínusz ${convertNumberToHungarianWord(Math.abs(num))}`;

  // Handle decimal numbers
  if (!Number.isInteger(num)) {
    const [intPart, decPart] = num.toString().split('.');
    const intWord = convertNumberToHungarianWord(parseInt(intPart));
    const decWord = decPart
      .split('')
      .map(d => HUNGARIAN_NUMBERS[parseInt(d)])
      .join(' ');
    return `${intWord} egész ${decWord}`;
  }

  let result = '';
  let n = Math.abs(num);

  // Handle large numbers
  for (const value of [1000000000, 1000000, 1000]) {
    if (n >= value) {
      const count = Math.floor(n / value);
      result += `${count > 1 ? convertNumberToHungarianWord(count) + ' ' : ''}${HUNGARIAN_NUMBERS[value]} `;
      n %= value;
    }
  }

  // Handle hundreds
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    result += `${hundreds > 1 ? HUNGARIAN_NUMBERS[hundreds] + ' ' : ''}${HUNGARIAN_NUMBERS[100]} `;
    n %= 100;
  }

  // Handle tens and ones
  if (n > 0) {
    if (n < 10) {
      result += HUNGARIAN_NUMBERS[n];
    } else {
      const tens = Math.floor(n / 10) * 10;
      const ones = n % 10;
      result += HUNGARIAN_NUMBERS[tens] + (ones > 0 ? HUNGARIAN_NUMBERS[ones] : '');
    }
  }

  return result.trim();
}

/**
 * Determines whether a Hungarian word should use "a" or "az" as its article
 */
export function getHungarianArticle(word: string | number): 'a' | 'az' {
  // Handle numbers by converting them to words first
  if (typeof word === 'number' || !isNaN(Number(word))) {
    const num = Number(word);
    const hungarianWord = convertNumberToHungarianWord(num);
    // For negative numbers, we check the first word (mínusz)
    if (num < 0) {
      return 'a'; // Because "mínusz" starts with 'm'
    }
    return getHungarianArticle(hungarianWord);
  }

  // Convert to lowercase and trim for consistency
  const lowerWord = word.trim().toLowerCase();

  // Empty string defaults to "a"
  if (!lowerWord) return 'a';

  // Special cases where pronunciation differs from spelling
  const specialCases: Record<string, 'a' | 'az'> = {
    egy: 'az',
    egyetlen: 'az',
    egyetem: 'az',
    egyetemi: 'az',
    egyesület: 'az',
    egyesült: 'az',
    együtt: 'az',
  };

  if (specialCases[lowerWord]) {
    return specialCases[lowerWord];
  }

  // Check if word starts with a vowel
  return VOWELS.has(lowerWord[0]) ? 'az' : 'a';
}

/**
 * Helper function to get the appropriate article for a name/word
 * @param name - The name or word to get the article for
 * @returns "a" or "az" depending on whether the word starts with a vowel
 */
export function getHungarianArticleForWord(name: string): string {
  return startsWithVowel(name) ? 'az' : 'a';
}

/**
 * Determines the correct form of a Hungarian suffix based on vowel harmony
 *
 * Hungarian words can be categorized into:
 * - Back vowel words (a, á, o, ó, u, ú)
 * - Front vowel words (e, é, i, í, ö, ő, ü, ű)
 * - Mixed vowel words (usually follow the last vowel)
 *
 * Common suffix pairs:
 * -ban/-ben (in)
 * -nak/-nek (to/for)
 * -val/-vel (with)
 * -ra/-re (onto)
 * -ba/-be (into)
 * etc.
 */
export function getHungarianSuffix(word: string, backSuffix: string, frontSuffix: string): string {
  // Define vowel groups
  const backVowels = ['a', 'á', 'o', 'ó', 'u', 'ú'];
  const frontVowels = ['e', 'é', 'i', 'í', 'ö', 'ő', 'ü', 'ű'];

  // Convert to lowercase for comparison
  const lowerWord = word.toLowerCase();

  // Find the last vowel in the word
  for (let i = lowerWord.length - 1; i >= 0; i--) {
    if (backVowels.includes(lowerWord[i])) {
      return backSuffix;
    } else if (frontVowels.includes(lowerWord[i])) {
      return frontSuffix;
    }
  }

  // If no vowels found, default to front vowel form
  return frontSuffix;
}

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
