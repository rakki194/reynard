/**
 * Comprehensive test suite for advanced pluralization rules
 * Testing Yipyap-inspired language-specific pluralization functions
 */

import { describe, it, expect } from "vitest";
import {
  getRussianPlural,
  getArabicPlural,
  getPolishPlural,
  getSpanishPlural,
  getTurkishPlural,
  getCzechPlural,
  getRomanianPlural,
  getPortuguesePlural,
} from "../../utils";

describe("Russian Pluralization", () => {
  it("should handle singular (1)", () => {
    const forms: [string, string, string] = ["файл", "файла", "файлов"];
    expect(getRussianPlural(1, forms)).toBe("файл");
    expect(getRussianPlural(21, forms)).toBe("файл");
    expect(getRussianPlural(101, forms)).toBe("файл");
  });

  it("should handle few (2-4)", () => {
    const forms: [string, string, string] = ["файл", "файла", "файлов"];
    expect(getRussianPlural(2, forms)).toBe("файла");
    expect(getRussianPlural(3, forms)).toBe("файла");
    expect(getRussianPlural(4, forms)).toBe("файла");
    expect(getRussianPlural(22, forms)).toBe("файла");
    expect(getRussianPlural(23, forms)).toBe("файла");
    expect(getRussianPlural(24, forms)).toBe("файла");
  });

  it("should handle many (0, 5-20, 25+)", () => {
    const forms: [string, string, string] = ["файл", "файла", "файлов"];
    expect(getRussianPlural(0, forms)).toBe("файлов");
    expect(getRussianPlural(5, forms)).toBe("файлов");
    expect(getRussianPlural(10, forms)).toBe("файлов");
    expect(getRussianPlural(11, forms)).toBe("файлов");
    expect(getRussianPlural(20, forms)).toBe("файлов");
    expect(getRussianPlural(25, forms)).toBe("файлов");
  });

  it("should handle negative numbers", () => {
    const forms: [string, string, string] = ["файл", "файла", "файлов"];
    expect(getRussianPlural(-1, forms)).toBe("файл");
    expect(getRussianPlural(-2, forms)).toBe("файла");
    expect(getRussianPlural(-5, forms)).toBe("файлов");
  });

  it("should handle decimal numbers", () => {
    const forms: [string, string, string] = ["файл", "файла", "файлов"];
    expect(getRussianPlural(1.5, forms)).toBe("файл");
    expect(getRussianPlural(2.7, forms)).toBe("файла");
    expect(getRussianPlural(5.3, forms)).toBe("файлов");
  });
});

describe("Arabic Pluralization", () => {
  it("should handle singular (1)", () => {
    const forms = {
      singular: "كتاب",
      dual: "كتابان",
      plural: "كتب",
      pluralLarge: "كتاب",
    };
    expect(getArabicPlural(1, forms)).toBe("كتاب");
  });

  it("should handle dual (2)", () => {
    const forms = {
      singular: "كتاب",
      dual: "كتابان",
      plural: "كتب",
      pluralLarge: "كتاب",
    };
    expect(getArabicPlural(2, forms)).toBe("كتابان");
  });

  it("should handle plural (3-10)", () => {
    const forms = {
      singular: "كتاب",
      dual: "كتابان",
      plural: "كتب",
      pluralLarge: "كتاب",
    };
    expect(getArabicPlural(3, forms)).toBe("كتب");
    expect(getArabicPlural(10, forms)).toBe("كتب");
  });

  it("should handle large plural (11+)", () => {
    const forms = {
      singular: "كتاب",
      dual: "كتابان",
      plural: "كتب",
      pluralLarge: "كتاب",
    };
    expect(getArabicPlural(11, forms)).toBe("كتاب");
    expect(getArabicPlural(100, forms)).toBe("كتاب");
  });

  it("should handle zero", () => {
    const forms = {
      singular: "كتاب",
      dual: "كتابان",
      plural: "كتب",
      pluralLarge: "كتاب",
    };
    expect(getArabicPlural(0, forms)).toBe("كتب");
  });
});

describe("Polish Pluralization", () => {
  it("should handle singular (1)", () => {
    const forms = {
      singular: "plik",
      plural2_4: "pliki",
      plural5_: "plików",
    };
    expect(getPolishPlural(1, forms)).toBe("plik");
    expect(getPolishPlural(21, forms)).toBe("plik");
    expect(getPolishPlural(31, forms)).toBe("plik");
  });

  it("should handle 2-4 (except 12-14)", () => {
    const forms = {
      singular: "plik",
      plural2_4: "pliki",
      plural5_: "plików",
    };
    expect(getPolishPlural(2, forms)).toBe("pliki");
    expect(getPolishPlural(3, forms)).toBe("pliki");
    expect(getPolishPlural(4, forms)).toBe("pliki");
    expect(getPolishPlural(22, forms)).toBe("pliki");
    expect(getPolishPlural(23, forms)).toBe("pliki");
    expect(getPolishPlural(24, forms)).toBe("pliki");
  });

  it("should handle 12-14 as plural5_", () => {
    const forms = {
      singular: "plik",
      plural2_4: "pliki",
      plural5_: "plików",
    };
    expect(getPolishPlural(12, forms)).toBe("plików");
    expect(getPolishPlural(13, forms)).toBe("plików");
    expect(getPolishPlural(14, forms)).toBe("plików");
  });

  it("should handle 0, 5-11, 15+ as plural5_", () => {
    const forms = {
      singular: "plik",
      plural2_4: "pliki",
      plural5_: "plików",
    };
    expect(getPolishPlural(0, forms)).toBe("plików");
    expect(getPolishPlural(5, forms)).toBe("plików");
    expect(getPolishPlural(10, forms)).toBe("plików");
    expect(getPolishPlural(11, forms)).toBe("plików");
    expect(getPolishPlural(15, forms)).toBe("plików");
    expect(getPolishPlural(20, forms)).toBe("plików");
  });
});

describe("Spanish Pluralization", () => {
  it("should handle singular (1)", () => {
    const forms = { singular: "archivo", plural: "archivos" };
    expect(getSpanishPlural(1, forms)).toBe("archivo");
  });

  it("should handle plural (0, 2+)", () => {
    const forms = { singular: "archivo", plural: "archivos" };
    expect(getSpanishPlural(0, forms)).toBe("archivos");
    expect(getSpanishPlural(2, forms)).toBe("archivos");
    expect(getSpanishPlural(10, forms)).toBe("archivos");
  });

  it("should handle negative numbers", () => {
    const forms = { singular: "archivo", plural: "archivos" };
    expect(getSpanishPlural(-1, forms)).toBe("archivo");
    expect(getSpanishPlural(-2, forms)).toBe("archivos");
  });

  it("should handle decimal numbers", () => {
    const forms = { singular: "archivo", plural: "archivos" };
    expect(getSpanishPlural(1.0, forms)).toBe("archivo");
    expect(getSpanishPlural(1.5, forms)).toBe("archivo"); // Math.trunc(1.5) = 1, so singular
  });
});

describe("Turkish Pluralization", () => {
  it("should use -lar for back vowels", () => {
    const forms = {
      singular: "kitap",
      pluralLar: "kitaplar",
      pluralLer: "kitapler",
    };
    expect(getTurkishPlural("kitap", forms)).toBe("kitaplar");
    expect(getTurkishPlural("masa", forms)).toBe("kitaplar");
    expect(getTurkishPlural("okul", forms)).toBe("kitaplar");
  });

  it("should use -ler for front vowels", () => {
    const forms = {
      singular: "ev",
      pluralLar: "evlar",
      pluralLer: "evler",
    };
    expect(getTurkishPlural("ev", forms)).toBe("evler");
    expect(getTurkishPlural("gün", forms)).toBe("evler");
    expect(getTurkishPlural("göz", forms)).toBe("evler");
  });

  it("should default to -ler if no vowels found", () => {
    const forms = {
      singular: "xyz",
      pluralLar: "xyzar",
      pluralLer: "xyzler",
    };
    expect(getTurkishPlural("xyz", forms)).toBe("xyzler");
  });
});

describe("Czech Pluralization", () => {
  it("should handle singular (1, but not 11)", () => {
    const forms = {
      singular: "soubor",
      plural2_4: "soubory",
      plural5_: "souborů",
    };
    expect(getCzechPlural(1, forms)).toBe("soubor");
    expect(getCzechPlural(21, forms)).toBe("soubor");
    expect(getCzechPlural(31, forms)).toBe("soubor");
  });

  it("should handle 11 as plural5_", () => {
    const forms = {
      singular: "soubor",
      plural2_4: "soubory",
      plural5_: "souborů",
    };
    expect(getCzechPlural(11, forms)).toBe("souborů");
  });

  it("should handle 2-4 (but not 12-14)", () => {
    const forms = {
      singular: "soubor",
      plural2_4: "soubory",
      plural5_: "souborů",
    };
    expect(getCzechPlural(2, forms)).toBe("soubory");
    expect(getCzechPlural(3, forms)).toBe("soubory");
    expect(getCzechPlural(4, forms)).toBe("soubory");
    expect(getCzechPlural(22, forms)).toBe("soubory");
    expect(getCzechPlural(23, forms)).toBe("soubory");
    expect(getCzechPlural(24, forms)).toBe("soubory");
  });

  it("should handle 12-14 as plural5_", () => {
    const forms = {
      singular: "soubor",
      plural2_4: "soubory",
      plural5_: "souborů",
    };
    expect(getCzechPlural(12, forms)).toBe("souborů");
    expect(getCzechPlural(13, forms)).toBe("souborů");
    expect(getCzechPlural(14, forms)).toBe("souborů");
  });

  it("should handle 0, 5-10, 15+ as plural5_", () => {
    const forms = {
      singular: "soubor",
      plural2_4: "soubory",
      plural5_: "souborů",
    };
    expect(getCzechPlural(0, forms)).toBe("souborů");
    expect(getCzechPlural(5, forms)).toBe("souborů");
    expect(getCzechPlural(10, forms)).toBe("souborů");
    expect(getCzechPlural(15, forms)).toBe("souborů");
    expect(getCzechPlural(20, forms)).toBe("souborů");
  });
});

describe("Romanian Pluralization", () => {
  it("should handle singular (1)", () => {
    const forms = { one: "carte", few: "cărți", many: "de cărți" };
    expect(getRomanianPlural(1, forms)).toBe("carte");
  });

  it("should handle few (0, 2-19)", () => {
    const forms = { one: "carte", few: "cărți", many: "de cărți" };
    expect(getRomanianPlural(0, forms)).toBe("cărți");
    expect(getRomanianPlural(2, forms)).toBe("cărți");
    expect(getRomanianPlural(19, forms)).toBe("cărți");
  });

  it("should handle many (20+)", () => {
    const forms = { one: "carte", few: "cărți", many: "de cărți" };
    expect(getRomanianPlural(20, forms)).toBe("de cărți");
    expect(getRomanianPlural(100, forms)).toBe("de cărți");
  });

  it("should handle decimal numbers", () => {
    const forms = { one: "carte", few: "cărți", many: "de cărți" };
    expect(getRomanianPlural(1.5, forms)).toBe("cărți");
    expect(getRomanianPlural(20.5, forms)).toBe("de cărți");
  });
});

describe("Portuguese Pluralization", () => {
  it("should handle singular (1)", () => {
    const forms = {
      singular: "leão",
      plural: "leões",
      pluralAlt: "leões",
    };
    expect(getPortuguesePlural(1, forms)).toBe("leão");
  });

  it("should handle plural (0, 2+)", () => {
    const forms = {
      singular: "leão",
      plural: "leões",
      pluralAlt: "leões",
    };
    expect(getPortuguesePlural(0, forms)).toBe("leões");
    expect(getPortuguesePlural(2, forms)).toBe("leões");
    expect(getPortuguesePlural(10, forms)).toBe("leões");
  });

  it("should use alternative plural for large numbers with -ão words", () => {
    const forms = {
      singular: "leão",
      plural: "leões",
      pluralAlt: "leões",
    };
    expect(getPortuguesePlural(11, forms)).toBe("leões");
    expect(getPortuguesePlural(100, forms)).toBe("leões");
  });

  it("should handle words without -ão ending", () => {
    const forms = {
      singular: "casa",
      plural: "casas",
    };
    expect(getPortuguesePlural(1, forms)).toBe("casa");
    expect(getPortuguesePlural(2, forms)).toBe("casas");
    expect(getPortuguesePlural(11, forms)).toBe("casas");
  });
});
