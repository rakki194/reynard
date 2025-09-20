/**
 * Comprehensive test suite for grammar helpers
 * Testing Yipyap-inspired language-specific grammar functions
 */

import { describe, it, expect } from "vitest";
import { getHungarianArticle, getHungarianSuffix } from "../../utils";

describe("Hungarian Articles", () => {
  it('should use "az" for words starting with vowels', () => {
    expect(getHungarianArticle("alma")).toBe("az");
    expect(getHungarianArticle("ember")).toBe("az");
    expect(getHungarianArticle("iskola")).toBe("az");
    expect(getHungarianArticle("óra")).toBe("az");
    expect(getHungarianArticle("úr")).toBe("az");
    expect(getHungarianArticle("élet")).toBe("az");
    expect(getHungarianArticle("író")).toBe("az");
    expect(getHungarianArticle("öreg")).toBe("az");
    expect(getHungarianArticle("őz")).toBe("az");
    expect(getHungarianArticle("üveg")).toBe("az");
    expect(getHungarianArticle("űr")).toBe("az");
  });

  it('should use "a" for words starting with consonants', () => {
    expect(getHungarianArticle("ház")).toBe("a");
    expect(getHungarianArticle("kert")).toBe("a");
    expect(getHungarianArticle("macska")).toBe("a");
    expect(getHungarianArticle("szék")).toBe("a");
    expect(getHungarianArticle("tér")).toBe("a");
  });

  it("should handle special cases correctly", () => {
    expect(getHungarianArticle("egy")).toBe("az");
    expect(getHungarianArticle("egyetlen")).toBe("az");
    expect(getHungarianArticle("egyetem")).toBe("az");
    expect(getHungarianArticle("egyetemi")).toBe("az");
    expect(getHungarianArticle("egyesület")).toBe("az");
    expect(getHungarianArticle("egyesült")).toBe("az");
    expect(getHungarianArticle("együtt")).toBe("az");
  });

  it("should handle numbers correctly", () => {
    expect(getHungarianArticle(1)).toBe("az"); // egy
    expect(getHungarianArticle(2)).toBe("a"); // kettő
    expect(getHungarianArticle(5)).toBe("az"); // öt
    expect(getHungarianArticle(6)).toBe("a"); // hat
    expect(getHungarianArticle(8)).toBe("a"); // nyolc
    expect(getHungarianArticle(10)).toBe("a"); // tíz
  });

  it("should handle negative numbers", () => {
    expect(getHungarianArticle(-1)).toBe("a"); // mínusz egy
    expect(getHungarianArticle(-5)).toBe("a"); // mínusz öt
  });

  it("should handle decimal numbers", () => {
    expect(getHungarianArticle(1.5)).toBe("az"); // egy egész öt (starts with 'e')
    expect(getHungarianArticle(2.3)).toBe("a"); // kettő egész három (starts with 'k')
  });

  it("should handle large numbers", () => {
    expect(getHungarianArticle(100)).toBe("a"); // száz
    expect(getHungarianArticle(1000)).toBe("az"); // ezer (starts with 'e')
    expect(getHungarianArticle(1000000)).toBe("a"); // millió
  });

  it("should handle empty strings", () => {
    expect(getHungarianArticle("")).toBe("a");
  });

  it("should handle case insensitive input", () => {
    expect(getHungarianArticle("ALMA")).toBe("az");
    expect(getHungarianArticle("HÁZ")).toBe("a");
    expect(getHungarianArticle("Egy")).toBe("az");
  });

  it("should handle trimmed input", () => {
    expect(getHungarianArticle("  alma  ")).toBe("az");
    expect(getHungarianArticle("  ház  ")).toBe("a");
  });
});

describe("Hungarian Suffix Selection", () => {
  it("should use back suffix for back vowel words", () => {
    expect(getHungarianSuffix("ház", "ban", "ben")).toBe("ban");
    expect(getHungarianSuffix("kert", "nak", "nek")).toBe("nek"); // last vowel 'e' (front)
    expect(getHungarianSuffix("macska", "val", "vel")).toBe("val");
    expect(getHungarianSuffix("szék", "ra", "re")).toBe("re"); // last vowel 'é' (front)
    expect(getHungarianSuffix("tér", "ba", "be")).toBe("be"); // last vowel 'é' (front)
  });

  it("should use front suffix for front vowel words", () => {
    expect(getHungarianSuffix("ember", "ban", "ben")).toBe("ben");
    expect(getHungarianSuffix("iskola", "nak", "nek")).toBe("nak"); // last vowel 'a' (back)
    expect(getHungarianSuffix("üveg", "val", "vel")).toBe("vel");
    expect(getHungarianSuffix("élet", "ra", "re")).toBe("re");
    expect(getHungarianSuffix("író", "ba", "be")).toBe("ba"); // last vowel 'ó' (back)
  });

  it("should use the last vowel to determine suffix", () => {
    expect(getHungarianSuffix("házak", "ban", "ben")).toBe("ban"); // last vowel: a
    expect(getHungarianSuffix("emberek", "ban", "ben")).toBe("ben"); // last vowel: e
    expect(getHungarianSuffix("iskolák", "nak", "nek")).toBe("nak"); // last vowel: á
    expect(getHungarianSuffix("üvegek", "nak", "nek")).toBe("nek"); // last vowel: e
  });

  it("should default to front suffix if no vowels found", () => {
    expect(getHungarianSuffix("xyz", "ban", "ben")).toBe("ben");
    expect(getHungarianSuffix("123", "nak", "nek")).toBe("nek");
  });

  it("should handle case insensitive input", () => {
    expect(getHungarianSuffix("HÁZ", "ban", "ben")).toBe("ban");
    expect(getHungarianSuffix("EMBER", "ban", "ben")).toBe("ben");
  });

  it("should handle mixed vowel words correctly", () => {
    // Words with both front and back vowels - should follow the last vowel
    expect(getHungarianSuffix("házak", "ban", "ben")).toBe("ban"); // last vowel: a (back)
    expect(getHungarianSuffix("emberek", "ban", "ben")).toBe("ben"); // last vowel: e (front)
  });

  it("should handle common suffix pairs", () => {
    // -ban/-ben (in)
    expect(getHungarianSuffix("ház", "ban", "ben")).toBe("ban");
    expect(getHungarianSuffix("ember", "ban", "ben")).toBe("ben");

    // -nak/-nek (to/for)
    expect(getHungarianSuffix("kert", "nak", "nek")).toBe("nek"); // last vowel 'e' (front)
    expect(getHungarianSuffix("iskola", "nak", "nek")).toBe("nak"); // last vowel 'a' (back)

    // -val/-vel (with)
    expect(getHungarianSuffix("macska", "val", "vel")).toBe("val");
    expect(getHungarianSuffix("üveg", "val", "vel")).toBe("vel");

    // -ra/-re (onto)
    expect(getHungarianSuffix("szék", "ra", "re")).toBe("re"); // last vowel 'é' (front)
    expect(getHungarianSuffix("élet", "ra", "re")).toBe("re");

    // -ba/-be (into)
    expect(getHungarianSuffix("tér", "ba", "be")).toBe("be"); // last vowel 'é' (front)
    expect(getHungarianSuffix("író", "ba", "be")).toBe("ba"); // last vowel 'ó' (back)
  });
});
