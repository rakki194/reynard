# Reynard I18n

🦊 **Enhanced internationalization system for the Reynard framework** - Now with Yipyap-inspired advanced features!

Comprehensive internationalization system with support for 37 languages, featuring sophisticated pluralization rules, grammar helpers, and advanced language-specific utilities.

## ✨ Features

### 🌍 **37 Language Support**

Complete translations for major world languages including European, Asian, Middle Eastern, and RTL languages.

### 🎯 **Advanced Pluralization**

Language-specific pluralization rules for complex languages:

- **Russian/Slavic**: 3-form pluralization (one, few, many)
- **Arabic**: 4-form pluralization (singular, dual, plural, large plural)
- **Polish/Czech**: Special teen number handling
- **Romanian**: Unique 3-form system
- **Turkish**: Vowel harmony-based pluralization

### 🧠 **Grammar Helpers**

Language-specific grammar utilities:

- **Hungarian**: Article selection (a/az) and vowel harmony suffixes
- **Turkish**: Vowel harmony for plural suffixes
- **Portuguese**: Complex plural form handling

### 🚀 **Performance Optimized**

- Dynamic translation loading with `import.meta.glob`
- Efficient fallback mechanisms
- Lazy loading of language files

### 🎨 **Developer Experience**

- Full TypeScript support with comprehensive type definitions
- SolidJS integration with reactive system
- Browser language detection
- Persistent language preferences
- Comprehensive test suite

## 📦 Installation

```bash
npm install reynard-i18n
```

## 🚀 Quick Start

```typescript
import { createI18nModule, useI18n, I18nProvider } from 'reynard-i18n';

// Create i18n module
const i18n = createI18nModule();

// Use in SolidJS component
function App() {
  return (
    <I18nProvider value={i18n}>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, locale, setLocale, languages } = useI18n();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <select onChange={(e) => setLocale(e.target.value)}>
        {languages.map(lang => (
          <option value={lang.code}>{lang.nativeName}</option>
        ))}
      </select>
    </div>
  );
}
```

## 🌍 Supported Languages

### European Languages

- **Germanic**: English, German, Dutch, Swedish, Norwegian, Danish
- **Romance**: French, Spanish, Italian, Portuguese, Romanian
- **Slavic**: Russian, Polish, Czech, Bulgarian, Croatian, Slovenian, Slovak, Ukrainian
- **Baltic**: Estonian, Latvian, Lithuanian
- **Others**: Hungarian, Finnish, Greek, Maltese

### Asian Languages

- **East Asian**: Japanese, Chinese, Korean
- **Southeast Asian**: Vietnamese, Thai, Indonesian
- **South Asian**: Hindi

### Middle Eastern Languages

- **Semitic**: Arabic, Hebrew
- **Turkic**: Turkish

### RTL Languages

- Arabic (العربية)
- Hebrew (עברית)

## 🔧 Advanced Features

### Sophisticated Pluralization

#### Russian Pluralization (3 Forms)

```typescript
import { getRussianPlural } from "reynard-i18n";

const forms: [string, string, string] = ["файл", "файла", "файлов"];
getRussianPlural(1, forms); // "файл" (singular)
getRussianPlural(2, forms); // "файла" (few)
getRussianPlural(5, forms); // "файлов" (many)
getRussianPlural(21, forms); // "файл" (singular)
getRussianPlural(22, forms); // "файла" (few)
```

#### Arabic Pluralization (4 Forms)

```typescript
import { getArabicPlural } from "reynard-i18n";

const forms = {
  singular: "كتاب",
  dual: "كتابان",
  plural: "كتب",
  pluralLarge: "كتاب",
};
getArabicPlural(1, forms); // "كتاب" (singular)
getArabicPlural(2, forms); // "كتابان" (dual)
getArabicPlural(3, forms); // "كتب" (plural)
getArabicPlural(11, forms); // "كتاب" (large plural)
```

#### Polish Pluralization (Special Teen Handling)

```typescript
import { getPolishPlural } from "reynard-i18n";

const forms = {
  singular: "plik",
  plural2_4: "pliki",
  plural5_: "plików",
};
getPolishPlural(1, forms); // "plik" (singular)
getPolishPlural(2, forms); // "pliki" (2-4)
getPolishPlural(5, forms); // "plików" (5+)
getPolishPlural(12, forms); // "plików" (teens)
```

### Grammar Helpers

#### Hungarian Articles

```typescript
import { getHungarianArticle } from "reynard-i18n";

getHungarianArticle("alma"); // "az" (vowel)
getHungarianArticle("ház"); // "a" (consonant)
getHungarianArticle("egy"); // "az" (special case)
getHungarianArticle(1); // "az" (egy)
getHungarianArticle(2); // "a" (kettő)
```

#### Hungarian Vowel Harmony

```typescript
import { getHungarianSuffix } from "reynard-i18n";

getHungarianSuffix("ház", "ban", "ben"); // "ban" (back vowel)
getHungarianSuffix("ember", "ban", "ben"); // "ben" (front vowel)
getHungarianSuffix("kert", "nak", "nek"); // "nak" (back vowel)
getHungarianSuffix("iskola", "nak", "nek"); // "nek" (front vowel)
```

#### Turkish Vowel Harmony

```typescript
import { getTurkishPlural } from "reynard-i18n";

const forms = {
  singular: "kitap",
  pluralLar: "kitaplar", // back vowels
  pluralLer: "kitapler", // front vowels
};
getTurkishPlural("kitap", forms); // "kitaplar" (back vowel)
getTurkishPlural("ev", forms); // "kitapler" (front vowel)
```

### Dynamic Translation Loading

```typescript
import { loadTranslations, translations } from "reynard-i18n";

// Load specific locale
const englishTranslations = await loadTranslations("en");

// Access all available translations
console.log(Object.keys(translations)); // ['en', 'fr', 'de', ...]
```

### Formatting Utilities

```typescript
import { formatNumber, formatDate, formatCurrency } from "reynard-i18n";

formatNumber(1234.56, "en"); // "1,234.56"
formatNumber(1234.56, "de"); // "1.234,56"
formatDate(new Date(), "en"); // "12/25/2023"
formatDate(new Date(), "de"); // "25.12.2023"
formatCurrency(99.99, "en", "USD"); // "$99.99"
formatCurrency(99.99, "de", "EUR"); // "99,99 €"
```

## 🎯 API Reference

### Core Functions

#### `createI18nModule(initialTranslations?)`

Creates a new i18n module instance with optional initial translations.

#### `useI18n()`

SolidJS hook to access i18n functionality within a component.

#### `loadTranslations(locale: LanguageCode)`

Dynamically loads translations for a specific locale with fallback support.

### Translation Function

#### `t(key: string, params?: TranslationParams)`

Translates a key with optional parameter interpolation.

```typescript
t("common.welcome"); // "Welcome"
t("common.greeting", { name: "John" }); // "Hello, John!"
t("common.itemCount", { count: 5 }); // "You have 5 items"
```

### Language Management

#### `setLocale(locale: LanguageCode)`

Changes the current locale and persists the preference.

#### `locale(): LanguageCode`

Gets the current locale.

#### `languages: Language[]`

Array of supported languages with metadata (code, name, nativeName, rtl).

#### `isRTL: boolean`

Boolean indicating if current locale is right-to-left.

### Advanced Pluralization Functions

- `getRussianPlural(num, forms)` - Russian/Slavic pluralization
- `getArabicPlural(count, forms)` - Arabic pluralization
- `getPolishPlural(count, forms)` - Polish pluralization
- `getSpanishPlural(count, forms)` - Spanish pluralization
- `getTurkishPlural(word, forms)` - Turkish vowel harmony
- `getCzechPlural(count, forms)` - Czech pluralization
- `getRomanianPlural(count, forms)` - Romanian pluralization
- `getPortuguesePlural(num, forms)` - Portuguese pluralization

### Grammar Helper Functions

- `getHungarianArticle(word)` - Hungarian article selection
- `getHungarianArticleForWord(name)` - Hungarian article for words
- `getHungarianSuffix(word, backSuffix, frontSuffix)` - Hungarian vowel harmony

### Utility Functions

- `formatNumber(value, locale)` - Locale-specific number formatting
- `formatDate(date, locale, options?)` - Locale-specific date formatting
- `formatCurrency(value, locale, currency)` - Locale-specific currency formatting
- `isRTL(locale)` - Check if locale is right-to-left
- `getBrowserLocale()` - Detect browser language
- `getInitialLocale()` - Get initial locale from storage or browser

## 🧪 Testing

The package includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- ✅ **Pluralization Rules**: All language-specific pluralization functions
- ✅ **Grammar Helpers**: Hungarian articles and vowel harmony
- ✅ **Core I18n**: Translation loading, locale management, RTL support
- ✅ **Utility Functions**: Formatting, validation, browser detection
- ✅ **Edge Cases**: Error handling, fallbacks, parameter interpolation

## 📝 Type Definitions

The package provides comprehensive TypeScript definitions:

```typescript
interface Translations {
  common: CommonTranslations;
  themes: ThemeTranslations;
  core: CoreTranslations;
  components: ComponentTranslations;
  gallery: GalleryTranslations;
  charts: ChartTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
  monaco: MonacoTranslations;
  settings: SettingsTranslations; // Enhanced from Yipyap
}

type LanguageCode =
  | "en"
  | "ja"
  | "fr"
  | "ru"
  | "zh"
  | "sv"
  | "pl"
  | "uk"
  | "fi"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "pt-BR"
  | "ko"
  | "nl"
  | "tr"
  | "vi"
  | "th"
  | "ar"
  | "he"
  | "hi"
  | "id"
  | "cs"
  | "el"
  | "hu"
  | "ro"
  | "bg"
  | "da"
  | "nb"
  | "sk"
  | "sl"
  | "hr"
  | "et"
  | "lv"
  | "lt"
  | "mt";

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}
```

## 🔄 Migration from Basic I18n

If you're upgrading from a basic i18n system, the enhanced Reynard I18n provides:

1. **Backward Compatibility**: All existing APIs work as before
2. **Enhanced Features**: Access to advanced pluralization and grammar helpers
3. **Better Performance**: Dynamic loading and optimized fallbacks
4. **Comprehensive Types**: Full TypeScript support for all features

## 🤝 Contributing

Contributions are welcome! The package follows these guidelines:

1. **Translation Quality**: All translations must be native-level quality
2. **Type Safety**: All new features must include TypeScript definitions
3. **Test Coverage**: New features require comprehensive test coverage
4. **Documentation**: All public APIs must be documented
5. **Performance**: New features should not impact bundle size significantly

### Adding New Languages

1. Create translation file in `src/lang/[code].ts`
2. Add language metadata to `languages` array in `utils.ts`
3. Add pluralization rules if needed
4. Update type definitions
5. Add comprehensive tests

### Adding Grammar Helpers

1. Implement helper functions in `utils.ts`
2. Add comprehensive test coverage
3. Document usage patterns
4. Export from main index file

## 📄 License

MIT License - see LICENSE file for details.

---

🦊 **Built with the cunning of a fox and the precision of an otter!** 🦦
