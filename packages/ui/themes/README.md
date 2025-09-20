# reynard-themes

A comprehensive theming and internationalization system for Reynard applications, based on yipyap's proven architecture.

## Features

### 🎨 Theming System

- **8 Built-in Themes**: Light, Dark, Gray, Banana, Strawberry, Peanut, High Contrast Black, High Contrast Inverse
- **LCH Color Space**: Consistent color generation and manipulation
- **CSS Custom Properties**: Dynamic theme switching with CSS variables
- **System Theme Detection**: Automatic light/dark mode based on user preferences
- **Accessibility**: Reduced motion and high contrast support
- **Theme Utilities**: Helper functions for theme-specific calculations

### 🌍 Internationalization (i18n)

- **30+ Languages**: Comprehensive language support
- **Type-Safe Translations**: Full TypeScript support with autocomplete
- **Pluralization Rules**: Language-specific plural forms
- **RTL Support**: Right-to-left layout for Arabic, Hebrew, etc.
- **Dynamic Loading**: Lazy-loaded translation files
- **Browser Locale Detection**: Automatic language detection

### 🔧 Developer Experience

- **Unified Provider**: Single `ReynardProvider` for both theming and i18n
- **SolidJS Integration**: Optimized for SolidJS with reactive signals
- **TypeScript First**: Full type safety and IntelliSense support
- **Tree Shaking**: Optimized bundle sizes
- **Hot Reload**: Development-friendly with Vite

## Installation

```bash
npm install reynard-themes
```

## Quick Start

### Basic Setup

```tsx
import { ReynardProvider } from "reynard-themes";
import "reynard-themes/themes.css";

function App() {
  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <YourApp />
    </ReynardProvider>
  );
}
```

### Using Themes

```tsx
import { useTheme } from "reynard-themes";

function ThemeToggle() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <select value={theme()} onChange={e => setTheme(e.target.value)}>
      {availableThemes.map(t => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
```

### Using Translations

```tsx
import { useTranslation } from "reynard-themes";

function WelcomeMessage() {
  const t = useTranslation();

  return (
    <div>
      <h1>{t("welcome.title")}</h1>
      <p>{t("welcome.message", { name: "John" })}</p>
    </div>
  );
}
```

## API Reference

### ReynardProvider

The main provider component that manages both theming and internationalization.

```tsx
interface ReynardProviderProps {
  defaultTheme?: ThemeName;
  defaultLocale?: LanguageCode;
  children: JSX.Element;
}
```

> _Props:_

- `defaultTheme`: Initial theme (default: "light")
- `defaultLocale`: Initial language (default: "en")
- `children`: Your application components

### useTheme Hook

Provides access to theme functionality.

```tsx
interface ThemeContext {
  theme: Accessor<ThemeName>;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
  isDark: Accessor<boolean>;
  isHighContrast: Accessor<boolean>;
}
```

> _Returns:_

- `theme`: Current theme signal
- `setTheme`: Function to change theme
- `availableThemes`: Array of all available themes
- `isDark`: Boolean signal indicating if current theme is dark
- `isHighContrast`: Boolean signal indicating if current theme is high contrast

### useTranslation Hook

Provides access to translation functionality.

```tsx
interface TranslationContext {
  t: TranslationFunction;
  locale: Accessor<LanguageCode>;
  setLocale: (locale: LanguageCode) => void;
  availableLocales: LanguageCode[];
  isRTL: Accessor<boolean>;
}
```

> _Returns:_

- `t`: Translation function with type safety
- `locale`: Current locale signal
- `setLocale`: Function to change language
- `availableLocales`: Array of all available languages
- `isRTL`: Boolean signal indicating if current language is RTL

### useI18n Hook

Provides access to internationalization utilities.

```tsx
interface I18nContext {
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date) => string;
}
```

### useReynard Hook

Provides access to the complete Reynard context.

```tsx
interface ReynardContext {
  theme: ThemeContext;
  i18n: TranslationContext & I18nContext;
}
```

## Available Themes

| Theme                   | Description             | Use Case                    |
| ----------------------- | ----------------------- | --------------------------- |
| `light`                 | Clean, bright interface | Default, professional apps  |
| `dark`                  | Dark mode for low light | Night usage, modern apps    |
| `gray`                  | Neutral gray tones      | Minimal, monochrome designs |
| `banana`                | Warm yellow accents     | Playful, creative apps      |
| `strawberry`            | Pink/red accents        | Social, lifestyle apps      |
| `peanut`                | Brown/beige tones       | Natural, organic themes     |
| `high-contrast-black`   | High contrast dark      | Accessibility, low vision   |
| `high-contrast-inverse` | High contrast light     | Accessibility, low vision   |

## Supported Languages

The package supports 30+ languages including:

- **English** (en) - Default
- **Spanish** (es)
- **French** (fr)
- **German** (de)
- **Italian** (it)
- **Portuguese** (pt)
- **Russian** (ru)
- **Chinese** (zh)
- **Japanese** (ja)
- **Korean** (ko)
- **Arabic** (ar) - RTL
- **Hebrew** (he) - RTL
- And many more...

## CSS Custom Properties

Each theme provides a comprehensive set of CSS custom properties:

```css
:root {
  /* Colors */
  --color-primary: lch(60% 0.15 250);
  --color-secondary: lch(70% 0.1 200);
  --color-background: lch(98% 0.01 250);
  --color-surface: lch(100% 0 0);
  --color-text: lch(20% 0.01 250);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* And many more... */
}
```

## Theme Utilities

### computeTagBackground

Generates background colors for tags based on theme.

```tsx
import { computeTagBackground } from "reynard-themes";

const bgColor = computeTagBackground("primary", "light");
// Returns: 'lch(95% 0.05 250)'
```

### computeTagColor

Generates text colors for tags based on theme.

```tsx
import { computeTagColor } from "reynard-themes";

const textColor = computeTagColor("primary", "light");
// Returns: 'lch(30% 0.2 250)'
```

### computeHoverStyles

Generates hover styles for interactive elements.

```tsx
import { computeHoverStyles } from "reynard-themes";

const hoverStyles = computeHoverStyles("primary", "light");
// Returns: { backgroundColor: 'lch(90% 0.1 250)', transform: 'translateY(-1px)' }
```

### computeAnimation

Generates animation properties based on user preferences.

```tsx
import { computeAnimation } from "reynard-themes";

const animation = computeAnimation("fadeIn");
// Returns: { animation: 'fadeIn 0.3s ease-in-out' } or {} if reduced motion
```

## Translation System

### Translation Files

Translations are organized by language and feature:

```json
{
  "welcome": {
    "title": "Welcome to Reynard",
    "message": "Hello, {name}! Welcome to our application."
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  }
}
```

### Pluralization

The system supports language-specific pluralization:

```json
{
  "items": {
    "zero": "No items",
    "one": "One item",
    "other": "{count} items"
  }
}
```

### RTL Support

For RTL languages, the system automatically:

- Detects RTL languages
- Provides RTL-aware utilities
- Handles text direction in CSS

## Advanced Usage

### Custom Theme Creation

```tsx
import { createTheme } from "reynard-themes";

const customTheme = createTheme({
  name: "custom",
  colors: {
    primary: "lch(60% 0.15 250)",
    secondary: "lch(70% 0.1 200)",
    // ... other colors
  },
});
```

### Custom Translation Loading

```tsx
import { loadTranslations } from "reynard-themes";

// Load custom translations
await loadTranslations("custom-lang", {
  welcome: {
    title: "Custom Welcome",
  },
});
```

### Theme-Aware Components

```tsx
import { useTheme } from "reynard-themes";

function ThemedButton() {
  const { theme, isDark } = useTheme();

  return (
    <button
      style={{
        backgroundColor: `var(--color-primary)`,
        color: isDark() ? "white" : "black",
      }}
    >
      Themed Button
    </button>
  );
}
```

## Performance

- **Tree Shaking**: Only import what you use
- **Lazy Loading**: Translations loaded on demand
- **CSS Variables**: Efficient theme switching
- **Memoization**: Optimized re-renders with SolidJS signals

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **CSS Custom Properties**: Required for theming
- **ES2022**: Modern JavaScript features
- **LCH Colors**: Progressive enhancement (falls back to HSL)

## Migration from yipyap

If you're migrating from yipyap's theme system:

1. Replace `ThemeProvider` with `ReynardProvider`
2. Update import paths from `yipyap/themes` to `reynard-themes`
3. Use the new unified hooks (`useTheme`, `useTranslation`)
4. Update CSS imports to `reynard-themes/themes.css`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
