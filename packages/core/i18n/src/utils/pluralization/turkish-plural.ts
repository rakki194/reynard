/**
 * Turkish Pluralization Rules
 * Handles Turkish plural forms with vowel harmony
 */

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
  const backVowels = ["a", "ı", "o", "u"];
  // Front vowels: e, i, ö, ü
  const frontVowels = ["e", "i", "ö", "ü"];

  // Find the last vowel in the word
  const letters = word.toLowerCase().split("");
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
