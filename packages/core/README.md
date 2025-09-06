# @reynard/core

> **The Foundation of the Reynard Framework** 🦊

Core utilities, composables, and modules that power the entire Reynard ecosystem. This package provides the essential building blocks for reactive state management, theming, notifications, and utility functions.

## ✨ Features

### 🎯 **Core Composables**

- **Theme Management**: Reactive theme switching with persistence
- **Notifications**: Toast notification system with queue management
- **Local Storage**: Reactive localStorage with cross-tab synchronization
- **Debouncing**: Performance-optimized debounced values and callbacks
- **Media Queries**: Responsive breakpoint detection
- **Internationalization**: Multi-language support with reactive translations

### 🛠️ **Utility Functions**

- **Validation**: Input validation and sanitization utilities
- **Formatting**: Date, number, and text formatting functions
- **Async Operations**: Batch processing, concurrency control, and retry logic
- **Performance**: Timing utilities and performance monitoring
- **Type Safety**: Comprehensive TypeScript definitions

### 🎨 **Core Modules**

- **Theme System**: 8 built-in themes with custom theme support
- **Notification System**: Toast notifications with auto-dismiss
- **I18n System**: Translation management with pluralization

## 📦 Installation

```bash
npm install @reynard/core solid-js
```

## 🚀 Quick Start

### Basic Theme Management

```tsx
import { createSignal } from "solid-js";
import { ThemeProvider, createTheme, useTheme } from "@reynard/core";

function App() {
  const themeModule = createTheme();
  
  return (
    <ThemeProvider value={themeModule}>
      <ThemedComponent />
    </ThemeProvider>
  );
}

function ThemedComponent() {
  const { theme, setTheme, nextTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme()}</p>
      <button onClick={() => setTheme("dark")}>Dark Theme</button>
      <button onClick={nextTheme}>Next Theme</button>
    </div>
  );
}
```

### Testable Theme Example

```tsx
import { createSignal } from "solid-js";
import { ThemeProvider, createTheme, useTheme } from "@reynard/core";

function ThemeDemo() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div data-testid="theme-demo">
      <span data-testid="current-theme">{theme()}</span>
      <button 
        data-testid="theme-button"
        onClick={() => setTheme("dark")}
      >
        Switch to Dark
      </button>
    </div>
  );
}

function TestableApp() {
  const themeModule = createTheme();
  
  return (
    <ThemeProvider value={themeModule}>
      <ThemeDemo />
    </ThemeProvider>
  );
}
```

### Notifications System

```tsx
import { NotificationsProvider, createNotifications, useNotifications } from "@reynard/core";

function App() {
  const notificationsModule = createNotifications();
  
  return (
    <NotificationsProvider value={notificationsModule}>
      <NotificationDemo />
    </NotificationsProvider>
  );
}

function NotificationDemo() {
  const { notify, dismiss, clear } = useNotifications();
  
  const showSuccess = () => notify("Operation completed!", "success");
  const showError = () => notify("Something went wrong!", "error");
  const showWarning = () => notify("Please check your input", "warning");
  
  return (
    <div>
      <button onClick={showSuccess}>Success</button>
      <button onClick={showError}>Error</button>
      <button onClick={showWarning}>Warning</button>
      <button onClick={clear}>Clear All</button>
    </div>
  );
}
```

### Local Storage with Reactivity

```tsx
import { useLocalStorage } from "@reynard/core";

function SettingsComponent() {
  const [settings, setSettings] = useLocalStorage("app-settings", {
    theme: "light",
    language: "en",
    notifications: true,
  });
  
  const updateTheme = (theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
  };
  
  return (
    <div>
      <p>Current theme: {settings().theme}</p>
      <button onClick={() => updateTheme("dark")}>Switch to Dark</button>
    </div>
  );
}
```

## 📚 API Reference

### Composables

#### `useTheme()`

Reactive theme management with persistence and cross-tab synchronization.

```tsx
const { theme, setTheme, nextTheme, availableThemes } = useTheme();
```

**Returns:**

- `theme()`: Current theme name
- `setTheme(name)`: Set specific theme
- `nextTheme()`: Cycle to next theme
- `availableThemes()`: Array of available theme names

**Example:**

```tsx
function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();
  
  return (
    <select value={theme()} onChange={(e) => setTheme(e.target.value)}>
      <For each={availableThemes()}>
        {(themeName) => <option value={themeName}>{themeName}</option>}
      </For>
    </select>
  );
}
```

#### `useNotifications()`

Toast notification system with queue management and auto-dismiss.

```tsx
const { notify, dismiss, clear, notifications } = useNotifications();
```

**Methods:**

- `notify(message, type?, options?)`: Show notification
- `dismiss(id)`: Dismiss specific notification
- `clear()`: Clear all notifications

**Types:** `"success" | "error" | "warning" | "info"`

**Example:**

```tsx
function NotificationDemo() {
  const { notify } = useNotifications();
  
  const handleSubmit = async () => {
    try {
      await submitForm();
      notify("Form submitted successfully!", "success");
    } catch (error) {
      notify("Failed to submit form", "error");
    }
  };
  
  return <button onClick={handleSubmit}>Submit</button>;
}
```

#### `useLocalStorage<T>(key, options)`

Reactive localStorage with type safety and cross-tab synchronization.

```tsx
const [value, setValue] = useLocalStorage<T>(key, defaultValue, options);
```

**Options:**

- `defaultValue`: Default value if key doesn't exist
- `serializer`: Custom serialization functions
- `syncAcrossTabs`: Enable cross-tab synchronization (default: true)

**Example:**

```tsx
function UserPreferences() {
  const [preferences, setPreferences] = useLocalStorage("user-prefs", {
    darkMode: false,
    language: "en",
    fontSize: 16,
  });
  
  const toggleDarkMode = () => {
    setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={preferences().darkMode} 
          onChange={toggleDarkMode} 
        />
        Dark Mode
      </label>
    </div>
  );
}
```

#### `useDebounce<T>(value, delay)`

Debounced reactive values for performance optimization.

```tsx
const debouncedValue = useDebounce(value, delay);
```

**Example:**

```tsx
function SearchComponent() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  createEffect(() => {
    if (debouncedSearchTerm()) {
      performSearch(debouncedSearchTerm());
    }
  });
  
  return (
    <input 
      value={searchTerm()} 
      onInput={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

#### `useDebouncedCallback<TArgs>(callback, delay)`

Debounced function calls to prevent excessive execution.

```tsx
const debouncedCallback = useDebouncedCallback(callback, delay);
```

**Example:**

```tsx
function AutoSaveComponent() {
  const [content, setContent] = createSignal("");
  const debouncedSave = useDebouncedCallback(
    (text: string) => saveToServer(text),
    1000
  );
  
  createEffect(() => {
    if (content()) {
      debouncedSave(content());
    }
  });
  
  return (
    <textarea 
      value={content()} 
      onInput={(e) => setContent(e.target.value)}
    />
  );
}
```

#### `useMediaQuery(query)`

Reactive media query detection for responsive design.

```tsx
const isMobile = useMediaQuery("(max-width: 768px)");
const isDark = useMediaQuery("(prefers-color-scheme: dark)");
```

**Example:**

```tsx
function ResponsiveComponent() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  return (
    <div>
      {isMobile() && <MobileLayout />}
      {isTablet() && !isMobile() && <TabletLayout />}
      {!isTablet() && <DesktopLayout />}
    </div>
  );
}
```

### Utility Functions

#### Validation Utilities

```tsx
import { validateEmail, validatePassword, sanitizeInput } from "@reynard/core";

// Email validation
const isValidEmail = validateEmail("user@example.com"); // true

// Password validation
const passwordStrength = validatePassword("MySecure123!", {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
});

// Input sanitization
const cleanInput = sanitizeInput("<script>alert('xss')</script>"); // "alert('xss')"
```

#### Formatting Utilities

```tsx
import { formatDate, formatNumber, formatCurrency } from "@reynard/core";

// Date formatting
const formattedDate = formatDate(new Date(), "YYYY-MM-DD"); // "2024-01-15"
const relativeDate = formatDate(new Date(), "relative"); // "2 hours ago"

// Number formatting
const formattedNumber = formatNumber(1234.56, { decimals: 2 }); // "1,234.56"
const percentage = formatNumber(0.75, { style: "percent" }); // "75%"

// Currency formatting
const price = formatCurrency(99.99, "USD"); // "$99.99"
const euro = formatCurrency(89.50, "EUR"); // "€89.50"
```

#### Async Utilities

```tsx
import { 
  batchExecute, 
  mapWithConcurrency, 
  retryWithBackoff,
  pollUntil 
} from "@reynard/core";

// Batch execution
const results = await batchExecute([
  () => fetch("/api/users"),
  () => fetch("/api/posts"),
  () => fetch("/api/comments"),
], 2); // Process 2 at a time

// Concurrency control
const processedData = await mapWithConcurrency(
  items,
  async (item) => processItem(item),
  5 // Max 5 concurrent operations
);

// Retry with exponential backoff
const result = await retryWithBackoff(
  () => riskyOperation(),
  3, // Max 3 retries
  1000 // Base delay 1 second
);

// Polling
const data = await pollUntil(
  () => checkCondition(),
  1000, // Check every 1 second
  30000 // Timeout after 30 seconds
);
```

### Core Modules

#### Theme System

```tsx
import { createTheme, ThemeProvider } from "@reynard/core";

// Create theme module
const themeModule = createTheme({
  defaultTheme: "light",
  storageKey: "app-theme",
  availableThemes: ["light", "dark", "banana", "strawberry"],
});

// Use in app
function App() {
  return (
    <ThemeProvider value={themeModule}>
      <YourApp />
    </ThemeProvider>
  );
}
```

#### Notification System

```tsx
import { createNotifications, NotificationsProvider } from "@reynard/core";

// Create notifications module
const notificationsModule = createNotifications({
  maxNotifications: 5,
  defaultDuration: 5000,
  position: "top-right",
});

// Use in app
function App() {
  return (
    <NotificationsProvider value={notificationsModule}>
      <YourApp />
    </NotificationsProvider>
  );
}
```

#### Internationalization

```tsx
import { createI18nModule, I18nProvider } from "@reynard/core";

// Create i18n module
const i18nModule = createI18nModule({
  locale: "en",
  fallbackLocale: "en",
  translations: {
    en: {
      "welcome": "Welcome to Reynard!",
      "user.greeting": "Hello, {{name}}!",
    },
    es: {
      "welcome": "¡Bienvenido a Reynard!",
      "user.greeting": "¡Hola, {{name}}!",
    },
  },
});

// Use in app
function App() {
  return (
    <I18nProvider value={i18nModule}>
      <YourApp />
    </I18nProvider>
  );
}
```

## 🎨 Theming

Reynard Core provides a comprehensive theming system with 8 built-in themes:

- **Light**: Clean and bright
- **Dark**: Easy on the eyes  
- **Gray**: Professional neutral
- **Banana**: Warm and cheerful
- **Strawberry**: Vibrant and energetic
- **Peanut**: Earthy and cozy
- **High Contrast Black**: Maximum accessibility
- **High Contrast Inverse**: Alternative high contrast

### Custom Themes

```tsx
import { createTheme } from "@reynard/core";

const customTheme = createTheme({
  name: "ocean",
  colors: {
    primary: "#0066cc",
    secondary: "#00aaff", 
    background: "#f0f8ff",
    surface: "#ffffff",
    text: "#001122",
  },
});
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

### Test Status

- ✅ **Core Tests**: All core functionality tests are passing (202 tests)
- ⚠️ **Async Tests**: Temporarily excluded due to fake timer conflicts with real async operations

The async utility tests (`src/utils/async.test.ts`) are currently excluded from the main test run due to conflicts between Vitest's fake timers and the actual async implementations. These tests can be run separately when needed, but may require manual timing adjustments.

## 📦 Bundle Size

- **Core composables**: ~8 kB (gzipped)
- **Utility functions**: ~12 kB (gzipped)  
- **Theme system**: ~4 kB (gzipped)
- **Total**: ~24 kB (gzipped)

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ using SolidJS and modern web standards** 🦊
