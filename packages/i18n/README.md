# reynard-i18n

🦦> A comprehensive internationalization system for the Reynard framework with 37 language support, based on yipyap's proven translation architecture.

## Features

### 🌍 Comprehensive Language Support

- **37 Languages**: English, Japanese, French, Russian, Chinese, Swedish, Polish, Ukrainian, Finnish, German, Spanish, Italian, Portuguese, Portuguese (Brazil), Korean, Dutch, Turkish, Vietnamese, Thai, Arabic, Hebrew, Hindi, Indonesian, Czech, Greek, Hungarian, Romanian, Bulgarian, Danish, Norwegian, Slovak, Slovenian, Croatian, Estonian, Latvian, Lithuanian, Maltese
- **RTL Support**: Full right-to-left layout support for Arabic and Hebrew
- **Cultural Adaptations**: Proper date formats, number formats, and currency formatting

### 🎯 Advanced Pluralization

- **Language-Specific Rules**: Complex pluralization for Slavic languages (Russian, Polish, Czech, etc.)
- **Arabic Pluralization**: Support for zero, one, two, few, many, and other forms
- **Romanian Pluralization**: Special handling for Romanian plural forms
- **Fallback System**: Graceful fallback to English for unsupported languages

### 🔧 Developer Experience

- **Type-Safe**: Full TypeScript support with autocomplete and type checking
- **Dynamic Loading**: Lazy-loaded translation files for optimal performance
- **SolidJS Integration**: Optimized for SolidJS with reactive signals
- **Tree Shaking**: Optimized bundle sizes with selective imports

### 📦 Package Coverage

- **Core Package**: Notifications, validation, date/time utilities
- **Component Package**: Modal, tabs, dropdown, tooltip translations
- **Gallery Package**: File operations, uploads, folder management
- **Chart Package**: Chart types, axes, legends, tooltips
- **Auth Package**: Login, registration, profile management
- **Chat Package**: Messaging, P2P features, room management
- **Monaco Package**: Code editor features and settings

## Installation

```bash
npm install reynard-i18n
```

## Quick Start

### Basic Setup

```tsx
import { I18nProvider, createI18nModule } from 'reynard-i18n';

function App() {
  const i18n = createI18nModule();
  
  return (
    <I18nProvider value={i18n}>
      <YourApp />
    </I18nProvider>
  );
}
```

### Using Translations

```tsx
import { useI18n } from 'reynard-i18n';

function MyComponent() {
  const { t, locale, setLocale, languages } = useI18n();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button onClick={() => setLocale('ja')}>
        {t('common.language')}
      </button>
    </div>
  );
}
```

### Language Selection

```tsx
import { useI18n } from 'reynard-i18n';

function LanguageSelector() {
  const { locale, setLocale, languages } = useI18n();
  
  return (
    <select value={locale()} onChange={(e) => setLocale(e.target.value)}>
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

## API Reference

### Core Functions

#### `createI18nModule(initialTranslations?)`

Creates a new i18n module instance.

```tsx
const i18n = createI18nModule();
```

#### `useI18n()`

Hook to access i18n functionality in components.

```tsx
const { t, locale, setLocale, languages, isRTL } = useI18n();
```

#### `loadTranslations(locale)`

Dynamically loads translations for a specific locale.

```tsx
const translations = await loadTranslations('ja');
```

### Translation Function

#### `t(key, params?)`

Translates a key with optional parameters.

```tsx
// Simple translation
t('common.save') // "Save"

// With parameters
t('gallery.fileCount', { count: 5 }) // "5 files"

// Nested keys
t('auth.login.title') // "Login"
```

### Utility Functions

#### `isRTL(locale)`

Checks if a locale uses right-to-left text direction.

```tsx
isRTL('ar') // true
isRTL('en') // false
```

#### `getBrowserLocale()`

Gets the user's preferred locale from browser settings.

```tsx
const locale = getBrowserLocale(); // 'en' | 'ja' | 'fr' | ...
```

#### `formatNumber(value, locale)`

Formats a number according to locale conventions.

```tsx
formatNumber(1234.56, 'de') // "1.234,56"
formatNumber(1234.56, 'en') // "1,234.56"
```

## Translation Structure

The translation system is organized into logical packages:

```typescript
interface Translations {
  common: CommonTranslations;      // Basic UI elements
  themes: ThemeTranslations;       // Theme names
  core: CoreTranslations;          // Core package features
  components: ComponentTranslations; // Component package
  gallery: GalleryTranslations;    // Gallery package
  charts: ChartTranslations;       // Chart package
  auth: AuthTranslations;          // Auth package
  chat: ChatTranslations;          // Chat package
  monaco: MonacoTranslations;      // Monaco package
}
```

## Adding New Languages

1. Create a new translation file in `src/lang/[locale].ts`
2. Follow the structure of existing translation files
3. Add the language to the `languages` array in `utils.ts`
4. Update pluralization rules if needed in `plurals.ts`

Example for a new language:

```typescript
// src/lang/xx.ts
export default {
  common: {
    close: 'Close in XX',
    // ... other translations
  },
  // ... other sections
} as const satisfies Translations;
```

## Pluralization

The system supports complex pluralization rules for different languages:

```typescript
// English (simple)
{ one: "1 file", other: "${count} files" }

// Russian (complex)
{ one: "1 файл", few: "${count} файла", many: "${count} файлов" }

// Arabic (very complex)
{ zero: "0 ملف", one: "ملف واحد", two: "ملفان", few: "${count} ملفات", many: "${count} ملف", other: "${count} ملف" }
```

## Performance

- **Lazy Loading**: Translation files are loaded on-demand
- **Tree Shaking**: Unused translations are excluded from bundles
- **Caching**: Loaded translations are cached in memory
- **Fallback**: Graceful fallback to English for missing translations

## Browser Support

- Modern browsers with ES2020 support
- SolidJS 1.8+
- TypeScript 5.0+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add translations for new languages
4. Update tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
