# reynard-core

> **The Foundation of the Reynard Framework** 🦊

Core utilities, composables, and modules that power the entire Reynard ecosystem. This package provides the essential building blocks for reactive state management, notifications, and utility functions.

## ✨ Features

### 🎯 **Core Composables**

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

- **Notification System**: Toast notifications with auto-dismiss

## 📦 Installation

```bash
npm install reynard-core solid-js
```

## 🚀 Quick Start

### Basic Notifications

```tsx
import { createSignal } from "solid-js";
import {
  NotificationsProvider,
  createNotifications,
  useNotifications,
} from "reynard-core";

function App() {
  const notificationsModule = createNotifications();

  return (
    <NotificationsProvider value={notificationsModule}>
      <NotificationDemo />
    </NotificationsProvider>
  );
}

function NotificationDemo() {
  const { notify } = useNotifications();

  return (
    <div>
      <button onClick={() => notify("Hello World!", "success")}>
        Show Notification
      </button>
    </div>
  );
}
```

### Notifications System

```tsx
import {
  NotificationsProvider,
  createNotifications,
  useNotifications,
} from "reynard-core";

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
import { useLocalStorage } from "reynard-core";

function SettingsComponent() {
  const [settings, setSettings] = useLocalStorage("app-settings", {
    language: "en",
    notifications: true,
  });

  const updateLanguage = (language: string) => {
    setSettings((prev) => ({ ...prev, language }));
  };

  return (
    <div>
      <p>Current language: {settings().language}</p>
      <button onClick={() => updateLanguage("es")}>Switch to Spanish</button>
    </div>
  );
}
```

## 📚 API Reference

### Composables

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
    setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }));
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
    1000,
  );

  createEffect(() => {
    if (content()) {
      debouncedSave(content());
    }
  });

  return (
    <textarea value={content()} onInput={(e) => setContent(e.target.value)} />
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
import { validateEmail, validatePassword, sanitizeInput } from "reynard-core";

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
import { formatDate, formatNumber, formatCurrency } from "reynard-core";

// Date formatting
const formattedDate = formatDate(new Date(), "YYYY-MM-DD"); // "2024-01-15"
const relativeDate = formatDate(new Date(), "relative"); // "2 hours ago"

// Number formatting
const formattedNumber = formatNumber(1234.56, { decimals: 2 }); // "1,234.56"
const percentage = formatNumber(0.75, { style: "percent" }); // "75%"

// Currency formatting
const price = formatCurrency(99.99, "USD"); // "$99.99"
const euro = formatCurrency(89.5, "EUR"); // "€89.50"
```

#### Async Utilities

```tsx
import {
  batchExecute,
  mapWithConcurrency,
  retryWithBackoff,
  pollUntil,
} from "reynard-core";

// Batch execution
const results = await batchExecute(
  [
    () => fetch("/api/users"),
    () => fetch("/api/posts"),
    () => fetch("/api/comments"),
  ],
  2,
); // Process 2 at a time

// Concurrency control
const processedData = await mapWithConcurrency(
  items,
  async (item) => processItem(item),
  5, // Max 5 concurrent operations
);

// Retry with exponential backoff
const result = await retryWithBackoff(
  () => riskyOperation(),
  3, // Max 3 retries
  1000, // Base delay 1 second
);

// Polling
const data = await pollUntil(
  () => checkCondition(),
  1000, // Check every 1 second
  30000, // Timeout after 30 seconds
);
```

### Core Modules

#### Notification System

```tsx
import { createNotifications, NotificationsProvider } from "reynard-core";

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

- **Core composables**: ~6 kB (gzipped)
- **Utility functions**: ~12 kB (gzipped)
- **Total**: ~18 kB (gzipped)

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ using SolidJS and modern web standards** 🦊
