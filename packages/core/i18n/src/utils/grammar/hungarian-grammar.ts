/**
 * Hungarian Grammar Helpers
 * Handles Hungarian-specific grammar rules including vowel harmony and articles
 */

// Hungarian number words
const HUNGARIAN_NUMBERS: { [key: number]: string } = {
  0: "nulla",
  1: "egy",
  2: "kettő",
  3: "három",
  4: "négy",
  5: "öt",
  6: "hat",
  7: "hét",
  8: "nyolc",
  9: "kilenc",
  10: "tíz",
  20: "húsz",
  30: "harminc",
  40: "negyven",
  50: "ötven",
  60: "hatvan",
  70: "hetven",
  80: "nyolcvan",
  90: "kilencven",
  100: "száz",
  1000: "ezer",
  1000000: "millió",
  1000000000: "milliárd",
};

const VOWELS = new Set(["a", "á", "e", "é", "i", "í", "o", "ó", "ö", "ő", "u", "ú", "ü", "ű"]);

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
    const [intPart, decPart] = num.toString().split(".");
    const intWord = convertNumberToHungarianWord(parseInt(intPart));
    const decWord = decPart
      .split("")
      .map(d => HUNGARIAN_NUMBERS[parseInt(d)])
      .join(" ");
    return `${intWord} egész ${decWord}`;
  }

  let result = "";
  let n = Math.abs(num);

  // Handle large numbers
  for (const value of [1000000000, 1000000, 1000]) {
    if (n >= value) {
      const count = Math.floor(n / value);
      result += `${count > 1 ? convertNumberToHungarianWord(count) + " " : ""}${HUNGARIAN_NUMBERS[value]} `;
      n %= value;
    }
  }

  // Handle hundreds
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    result += `${hundreds > 1 ? HUNGARIAN_NUMBERS[hundreds] + " " : ""}${HUNGARIAN_NUMBERS[100]} `;
    n %= 100;
  }

  // Handle tens and ones
  if (n > 0) {
    if (n < 10) {
      result += HUNGARIAN_NUMBERS[n];
    } else {
      const tens = Math.floor(n / 10) * 10;
      const ones = n % 10;
      result += HUNGARIAN_NUMBERS[tens] + (ones > 0 ? HUNGARIAN_NUMBERS[ones] : "");
    }
  }

  return result.trim();
}

/**
 * Determines whether a Hungarian word should use "a" or "az" as its article
 */
export function getHungarianArticle(word: string | number): "a" | "az" {
  // Handle numbers by converting them to words first
  if (typeof word === "number" || !isNaN(Number(word))) {
    const num = Number(word);
    const hungarianWord = convertNumberToHungarianWord(num);
    // For negative numbers, we check the first word (mínusz)
    if (num < 0) {
      return "a"; // Because "mínusz" starts with 'm'
    }
    return getHungarianArticle(hungarianWord);
  }

  // Convert to lowercase and trim for consistency
  const lowerWord = word.trim().toLowerCase();

  // Empty string defaults to "a"
  if (!lowerWord) return "a";

  // Special cases where pronunciation differs from spelling
  const specialCases: Record<string, "a" | "az"> = {
    egy: "az",
    egyetlen: "az",
    egyetem: "az",
    egyetemi: "az",
    egyesület: "az",
    egyesült: "az",
    együtt: "az",
  };

  if (specialCases[lowerWord]) {
    return specialCases[lowerWord];
  }

  // Check if word starts with a vowel
  return VOWELS.has(lowerWord[0]) ? "az" : "a";
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
  const backVowels = ["a", "á", "o", "ó", "u", "ú"];
  const frontVowels = ["e", "é", "i", "í", "ö", "ő", "ü", "ű"];

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
