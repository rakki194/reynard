# Reynard i18n Demo

🦦> A comprehensive demonstration of Reynard's internationalization system with support for 37 languages, advanced pluralization rules, and RTL support.

## Features

### 🌍 Language Support

- **37 Languages**: Complete coverage including English, Japanese, French, Russian, Chinese, Arabic, Hebrew, and many more
- **RTL Support**: Full right-to-left layout support for Arabic and Hebrew
- **Dynamic Loading**: Lazy-loaded translation files for optimal performance

### 🎯 Advanced Features

- **Type-Safe Translations**: Full TypeScript support with autocomplete
- **Pluralization Rules**: Language-specific plural forms (Arabic, Russian, Polish, etc.)
- **Cultural Adaptations**: Proper date formats, number formats, and currency formatting
- **Fallback System**: Graceful fallback to English for missing translations

### 📦 Package Coverage

- **Core Package**: Notifications, validation, date/time utilities
- **Component Package**: Modal, tabs, dropdown, tooltip translations
- **Gallery Package**: File operations, uploads, folder management
- **Chart Package**: Chart types, axes, legends, tooltips
- **Auth Package**: Login, registration, profile management
- **Chat Package**: Messaging, P2P features, room management
- **Monaco Package**: Code editor features and settings

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Language Selection**: Use the language selector to switch between 37 supported languages
2. **Theme Integration**: Combine with Reynard's theming system for complete UI customization
3. **RTL Support**: Switch to Arabic or Hebrew to see RTL layout in action
4. **Translation Examples**: Explore various translation categories and use cases

## Demo Features

### Interactive Components

- **Language Selector**: Switch between all 37 supported languages
- **Theme Selector**: Combine i18n with Reynard's theming system
- **Translation Examples**: See translations in action across different UI components
- **Counter Demo**: Demonstrates pluralization rules
- **Status Messages**: Shows various message types and states

### Translation Categories

- **Basic Actions**: Save, cancel, delete, edit, etc.
- **Navigation**: Home, back, next, previous
- **Form Elements**: Labels, placeholders, validation messages
- **Package-Specific**: Translations for each Reynard package
- **Status Messages**: Success, warning, error, info states

## Code Examples

### Basic Usage

```tsx
import { useI18n } from "reynard-i18n";

function MyComponent() {
  const { t, locale, setLocale, languages } = useI18n();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button onClick={() => setLocale("ja")}>{t("common.language")}</button>
    </div>
  );
}
```

### Language Selection

```tsx
function LanguageSelector() {
  const { locale, setLocale, languages } = useI18n();

  return (
    <select value={locale()} onChange={(e) => setLocale(e.target.value)}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

### RTL Support

```tsx
function MyComponent() {
  const { t, isRTL } = useI18n();

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <h1>{t("common.welcome")}</h1>
    </div>
  );
}
```

## Supported Languages

| Code  | Language            | Native Name        |
| ----- | ------------------- | ------------------ |
| en    | English             | English            |
| ja    | Japanese            | 日本語             |
| fr    | French              | Français           |
| ru    | Russian             | Русский            |
| zh    | Chinese             | 简体中文           |
| ar    | Arabic              | العربية            |
| he    | Hebrew              | עברית              |
| de    | German              | Deutsch            |
| es    | Spanish             | Español            |
| it    | Italian             | Italiano           |
| pt    | Portuguese          | Português          |
| pt-BR | Portuguese (Brazil) | Português (Brasil) |
| ko    | Korean              | 한국어             |
| nl    | Dutch               | Nederlands         |
| tr    | Turkish             | Türkçe             |
| vi    | Vietnamese          | Tiếng Việt         |
| th    | Thai                | ไทย                |
| hi    | Hindi               | हिन्दी             |
| id    | Indonesian          | Bahasa Indonesia   |
| cs    | Czech               | Čeština            |
| el    | Greek               | Ελληνικά           |
| hu    | Hungarian           | Magyar             |
| ro    | Romanian            | Română             |
| bg    | Bulgarian           | Български          |
| da    | Danish              | Dansk              |
| nb    | Norwegian           | Norsk              |
| sv    | Swedish             | Svenska            |
| pl    | Polish              | Polski             |
| uk    | Ukrainian           | Українська         |
| fi    | Finnish             | Suomi              |
| sk    | Slovak              | Slovenčina         |
| sl    | Slovenian           | Slovenščina        |
| hr    | Croatian            | Hrvatski           |
| et    | Estonian            | Eesti              |
| lv    | Latvian             | Latviešu           |
| lt    | Lithuanian          | Lietuvių           |
| mt    | Maltese             | Malti              |

## Architecture

The demo showcases Reynard's i18n architecture:

1. **Centralized Package**: `reynard-i18n` provides the core functionality
2. **Type Safety**: Full TypeScript support with autocomplete
3. **Dynamic Loading**: Translation files loaded on-demand
4. **Pluralization**: Language-specific plural rules
5. **RTL Support**: Automatic direction handling
6. **Fallback System**: Graceful degradation for missing translations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add translations for new languages
4. Test the changes
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
