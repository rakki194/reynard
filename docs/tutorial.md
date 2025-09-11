# 📚 Complete Tutorial: Building Your First Reynard App

*Master the cunning SolidJS framework with this comprehensive guide to Reynard's
architecture and capabilities*

This tutorial will guide you through creating a complete application with Reynard,
from understanding the framework's modular architecture to building and
deploying a production-ready app.

## 🦊 What is Reynard?

Reynard is a cunning SolidJS framework derived from **YipYap**, a multi-modal content
management system. The framework extracts and modularizes YipYap's proven
architectural patterns into 40+ reusable packages for modern web development.

### Key Features

- **🎯 Modular Architecture** - 40+ specialized packages that work independently
  or together
- **🎨 Advanced Theming** - OKLCH color system with comprehensive theme
  management
- **🌍 Internationalization** - Built-in i18n with RTL support and translation
  management
- **🔔 Notifications** - Production-ready notification system with grouping and
  auto-dismiss
- **🎮 Rich Components** - UI primitives, 3D components, charts, games, and more
- **🤖 AI Integration** - Caption generation, RAG system, and multimodal AI
  capabilities
- **📱 Responsive Design** - Mobile-first components with accessibility built-in

## Step 1: Project Setup

### Option A: Using the Starter Template (Recommended)

The easiest way to get started is with the included starter template:

```bash
# Navigate to the starter template
cd templates/starter

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Visit `http://localhost:3001` to see the comprehensive Reynard showcase in
action.

### Option B: Using the Basic App Example

For a simpler starting point:

```bash
# Navigate to the basic app example
cd examples/basic-app

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Option C: Create a New Project

```bash
# Create a new directory
mkdir my-reynard-app
cd my-reynard-app

# Initialize package.json
pnpm init

# Install core Reynard packages
pnpm install reynard-core reynard-themes reynard-components solid-js
pnpm install -D vite vite-plugin-solid typescript @types/node
```

## Step 2: Understanding Reynard's Package Architecture

Reynard consists of 40+ specialized packages, each with a specific purpose:

### Core Packages

| Package | Purpose | Key Features |
|---------|---------|--------------|
| `reynard-core` | Foundation utilities | Notifications, composables, HTTP |
| `reynard-themes` | Theming system | OKLCH colors, i18n, themes |
| `reynard-components` | UI components | Primitives, layouts, composite |
| `reynard-fluent-icons` | Icon system | 1000+ Fluent UI icons |

### Specialized Packages

| Package | Purpose | Key Features |
|---------|---------|--------------|
| `reynard-chat` | Chat system | Real-time messaging, message history |
| `reynard-rag` | RAG system | Vector search, embeddings, retrieval |
| `reynard-auth` | Authentication | User management, JWT, OAuth |
| `reynard-gallery` | Media management | File uploads, thumbnails, galleries |
| `reynard-annotating` | AI captioning | Multiple AI models, batch processing |
| `reynard-floating-panel` | Floating panels | Staggered animations, state management |
| `reynard-3d` | 3D components | Three.js integration, 3D scenes |
| `reynard-charts` | Data visualization | Charts, graphs, analytics |
| `reynard-games` | Game components | Roguelike, puzzle games |
| `reynard-algorithms` | Algorithm primitives | Data structures, utilities |

### Project Structure

Create the following file structure for a new project:

```plaintext
my-reynard-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── components/
    │   ├── TodoItem.tsx
    │   ├── AddTodo.tsx
    │   └── ThemeToggle.tsx
    └── translations/
        ├── en.json
        └── es.json
```

## Step 3: Configuration Files

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'reynard-core': ['reynard-core'],
          'reynard-themes': ['reynard-themes'],
          'reynard-components': ['reynard-components'],
        }
      }
    }
  }
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### `package.json`

```json
{
  "name": "my-reynard-app",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "reynard-core": "^0.1.3",
    "reynard-themes": "^0.1.3",
    "reynard-components": "^0.1.2",
    "reynard-fluent-icons": "^0.1.0",
    "solid-js": "1.9.9"
  },
  "devDependencies": {
    "@types/node": "24.3.1",
    "typescript": "5.9.2",
    "vite": "7.1.5",
    "vite-plugin-solid": "2.11.8"
  }
}
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Reynard App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 4: Understanding Reynard's Theming System

Reynard uses a sophisticated OKLCH-based theming system with built-in
internationalization. The theming system provides:

- **OKLCH Color Space** - Perceptually uniform colors for better accessibility
- **Automatic Theme Generation** - Generate complementary colors and palettes
- **Built-in Internationalization** - RTL support and translation management
- **System Theme Detection** - Automatic light/dark mode detection
- **Animation Support** - Smooth transitions between themes

### Key Theme Features

- **40+ Built-in Themes** - From subtle professional themes to vibrant creative ones
- **OKLCH Color System** - Modern CSS color space for better color consistency
- **Accessibility First** - WCAG 2.1 compliant color combinations
- **Performance Optimized** - CSS custom properties with minimal runtime overhead

## Step 5: Application Entry Point

### `src/main.tsx`

```tsx
import { render } from "solid-js/web";
import App from "./App";

render(() => <App />, document.getElementById("root")!);
```

The main entry point is simple - all the theming and styling is handled by the
Reynard providers.

## Step 6: Main Application Component

### `src/App.tsx`

```tsx
import { Component } from "solid-js";
import { ReynardProvider } from "reynard-themes";
import { NotificationsProvider, createNotificationsModule } from "reynard-core";
import { Button, Card } from "reynard-components";
import "reynard-themes/reynard-themes.css";
import "reynard-components/styles";
import "./styles.css";

const AppContent: Component = () => {
  return (
    <div class="app">
      <header class="app-header">
        <h1>🦊 Welcome to Reynard</h1>
        <p>Your first Reynard application with theming and notifications!</p>
      </header>

      <main class="app-main">
        <Card padding="lg">
          <h2>Theme Demo</h2>
          <p>This is a simple version to test the basic setup.</p>
          
          <div class="theme-controls">
            <Button>Test Button</Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <AppContent />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
```

## Step 7: Adding Basic Styles

### `src/styles.css`

```css
/* App Layout */
.app {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.app-header {
  text-align: center;
  padding: 2rem;
  background-color: var(--secondary-bg);
  border-bottom: 1px solid var(--border-color);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 2.5rem;
}

.app-header p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.header-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.theme-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.app-main {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Todo Styles */
.todo-stats {
  margin-bottom: 1rem;
  text-align: center;
}

.stat {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.add-todo {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 6px);
  transition: all 0.2s ease;
}

.todo-item:hover {
  background-color: var(--secondary-bg);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-checkbox {
  position: relative;
  cursor: pointer;
}

.todo-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  display: block;
  width: 20px;
  height: 20px;
  background-color: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.todo-checkbox input:checked ~ .checkmark {
  background-color: var(--accent);
  border-color: var(--accent);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.todo-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.todo-text {
  flex: 1;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .header-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .add-todo {
    flex-direction: column;
  }
}
```

## Step 8: Building a Complete Todo App

Let's build a comprehensive todo application that demonstrates multiple Reynard
features including theming, notifications, and internationalization. This example
shows the proper modular structure with separate components and translation files.

### Project Structure for Todo App

Create the following structure for a comprehensive todo app:

```plaintext
my-reynard-app/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles.css
│   ├── components/
│   │   ├── TodoItem.tsx
│   │   ├── AddTodo.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── LanguageSelector.tsx
│   └── translations/
│       ├── index.ts
│       ├── en.ts
│       ├── es.ts
│       └── fr.ts
```

### Main `src/App.tsx`

```tsx
/**
 * Basic Todo App - Reynard Framework Example
 * Demonstrates core Reynard features in a simple, practical application
 */

import {
  Component,
  createSignal,
  For,
  createResource,
  createContext,
  useContext,
} from "solid-js";
import {
  ReynardProvider,
  useTheme,
  useI18n,
  type LanguageCode,
} from "reynard-themes";
import { loadTranslations } from "./translations";
import {
  NotificationsProvider,
  useNotifications,
  createNotificationsModule,
} from "reynard-core";
import { TodoItem } from "./components/TodoItem";
import { AddTodo } from "./components/AddTodo";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageSelector } from "./components/LanguageSelector";
import "reynard-themes/reynard-themes.css";
import "./styles.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Custom translation context
const CustomTranslationContext = createContext<
  ((key: string, params?: Record<string, string>) => string) | undefined
>();

export const useCustomTranslation = () => {
  const context = useContext(CustomTranslationContext);
  if (!context) {
    throw new Error(
      "useCustomTranslation must be used within a CustomTranslationProvider",
    );
  }
  return context;
};

const TodoApp: Component = () => {
  const [todos, setTodos] = createSignal<Todo[]>([
    { id: 1, text: "Learn SolidJS", completed: true },
    { id: 2, text: "Try Reynard framework", completed: false },
    { id: 3, text: "Build something awesome", completed: false },
  ]);
  const [nextId, setNextId] = createSignal(4);
  const { theme } = useTheme();
  const { notify } = useNotifications();
  const { locale, setLocale } = useI18n();

  // Create a reactive signal for locale changes
  const [currentLocale, setCurrentLocale] = createSignal(locale);

  // Custom setLocale that updates both the theme provider and our signal
  const customSetLocale = (newLocale: LanguageCode) => {
    setLocale(newLocale);
    setCurrentLocale(newLocale);
  };

  // Load custom translations for this app
  const [translationsResource] = createResource(() => {
    return currentLocale();
  }, loadTranslations);

  // Create a custom translation function that uses our app's translations
  const customT = (key: string, params?: Record<string, string>) => {
    const translations = translationsResource();

    if (!translations) {
      return key;
    }

    // Simple nested key lookup
    const keys = key.split(".");
    let value: unknown = translations;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }

    if (typeof value === "string") {
      // Simple parameter replacement
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }
      return value;
    }

    return key;
  };

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: nextId(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setNextId((prev) => prev + 1);
    notify(customT("todo.added", { text }), "success");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: number) => {
    const todo = todos().find((t) => t.id === id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    if (todo) {
      notify(customT("todo.deleted", { text: todo.text }), "info");
    }
  };

  const completedCount = () => todos().filter((todo) => todo.completed).length;
  const totalCount = () => todos().length;

  return (
    <div class="app">
      <header class="app-header">
        <h1>
          <span class="reynard-logo">🦊</span>
          {customT("app.title")}
        </h1>
        <p>{customT("app.subtitle")}</p>
        <div class="header-controls">
          <div class="theme-info">
            {customT("theme.current", { theme: customT(`theme.${theme}`) })}
          </div>
          <CustomTranslationContext.Provider value={customT}>
            <ThemeToggle />
          </CustomTranslationContext.Provider>
          <LanguageSelector setLocale={customSetLocale} />
        </div>
      </header>

      <main class="app-main">
        <div class="todo-container">
          <div class="todo-stats">
            <span class="stat">
              {completedCount()} / {totalCount()} {customT("todo.completed")}
            </span>
          </div>

          <CustomTranslationContext.Provider value={customT}>
            <AddTodo onAdd={addTodo} />
          </CustomTranslationContext.Provider>

          <div class="todo-list">
            <For each={todos()}>
              {(todo) => (
                <TodoItem
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              )}
            </For>
            {todos().length === 0 && (
              <div class="empty-state">
                <p>{customT("todo.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>{customT("footer.text")}</p>
      </footer>
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <TodoApp />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
```

### Component Files

#### `src/components/TodoItem.tsx`

```tsx
/**
 * TodoItem Component
 * Individual todo item with toggle and delete functionality
 */

import { Component } from "solid-js";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export const TodoItem: Component<TodoItemProps> = (props) => {
  return (
    <div class={`todo-item ${props.todo.completed ? "completed" : ""}`}>
      <label class="todo-checkbox" for={`todo-${props.todo.id}`}>
        <input
          id={`todo-${props.todo.id}`}
          type="checkbox"
          checked={props.todo.completed}
          onChange={() => props.onToggle()}
          aria-label={`Mark "${props.todo.text}" as ${
            props.todo.completed ? "incomplete" : "complete"
          }`}
        />
        <span class="checkmark" />
      </label>

      <span class="todo-text">{props.todo.text}</span>

      <button
        class="todo-delete"
        onClick={() => props.onDelete()}
        title="Delete todo"
      >
        ×
      </button>
    </div>
  );
};
```

#### `src/components/AddTodo.tsx`

```tsx
/**
 * AddTodo Component
 * Form for adding new todos
 */

import { Component, createSignal } from "solid-js";
import { useCustomTranslation } from "../App";

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export const AddTodo: Component<AddTodoProps> = (props) => {
  const [input, setInput] = createSignal("");
  const t = useCustomTranslation();

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const text = input().trim();
    if (text) {
      props.onAdd(text);
      setInput("");
    }
  };

  return (
    <form class="add-todo" onSubmit={handleSubmit}>
      <input
        type="text"
        class="todo-input"
        placeholder={t("todo.placeholder")}
        value={input()}
        onInput={(e) => setInput(e.currentTarget.value)}
      />
      <button type="submit" class="add-button" disabled={!input().trim()}>
        {t("todo.addButton")}
      </button>
    </form>
  );
};
```

#### `src/components/ThemeToggle.tsx`

```tsx
/**
 * ThemeToggle Component
 * Button to cycle through available themes
 */

import { Component } from "solid-js";
import { useTheme } from "reynard-themes";
import { useCustomTranslation } from "../App";

export const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme();
  const t = useCustomTranslation();

  const themes = ["light", "gray", "dark", "banana", "strawberry", "peanut"];
  const currentIndex = () => themes.indexOf(theme);
  
  const nextTheme = () => {
    const nextIndex = (currentIndex() + 1) % themes.length;
    setTheme(themes[nextIndex] as any);
  };

  return (
    <button class="theme-toggle" onClick={nextTheme}>
      {t("theme.switchTo", { theme: t(`theme.${theme}`) })}
    </button>
  );
};
```

#### `src/components/LanguageSelector.tsx`

```tsx
/**
 * LanguageSelector Component
 * Dropdown to select application language
 */

import { Component } from "solid-js";
import { type LanguageCode } from "reynard-themes";

interface LanguageSelectorProps {
  setLocale: (locale: LanguageCode) => void;
}

export const LanguageSelector: Component<LanguageSelectorProps> = (props) => {
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
  ];

  return (
    <select 
      class="language-selector"
      onChange={(e) => props.setLocale(e.currentTarget.value as LanguageCode)}
    >
      {languages.map((lang) => (
        <option value={lang.code}>{lang.name}</option>
      ))}
    </select>
  );
};
```

### Translation Files

#### `src/translations/index.ts`

```tsx
/**
 * Translation loader for Basic Todo App
 */

import type { Translations } from "reynard-core";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";

export const translations: Record<string, Translations> = {
  en,
  es,
  fr,
};

export const loadTranslations = async (
  locale: string,
): Promise<Translations> => {
  // Return available translation or fallback to English
  return translations[locale] || translations.en;
};
```

#### `src/translations/en.ts`

```tsx
/**
 * English translations for Basic Todo App
 */

export const en = {
  app: {
    title: "Todo App",
    subtitle: "A simple todo app built with Reynard framework",
  },
  todo: {
    placeholder: "What needs to be done?",
    addButton: "Add Todo",
    completed: "completed",
    empty: "No todos yet. Add one above! ✨",
    added: 'Added: "{text}"',
    deleted: 'Deleted: "{text}"',
  },
  theme: {
    current: "Current theme: {theme}",
    switchTo: "Current: {theme}",
    light: "light",
    gray: "gray",
    dark: "dark",
    banana: "banana",
    strawberry: "strawberry",
    peanut: "peanut",
    "high-contrast-black": "high contrast black",
    "high-contrast-inverse": "high contrast inverse",
  },
  footer: {
    text: "Built with Reynard framework • SolidJS • Love",
  },
};
```

#### `src/translations/es.ts`

```tsx
/**
 * Spanish translations for Basic Todo App
 */

export const es = {
  app: {
    title: "Aplicación de Tareas",
    subtitle: "Una aplicación simple de tareas construida con el framework Reynard",
  },
  todo: {
    placeholder: "¿Qué necesita hacerse?",
    addButton: "Agregar Tarea",
    completed: "completadas",
    empty: "¡No hay tareas aún. Agrega una arriba! ✨",
    added: 'Agregado: "{text}"',
    deleted: 'Eliminado: "{text}"',
  },
  theme: {
    current: "Tema actual: {theme}",
    switchTo: "Actual: {theme}",
    light: "claro",
    gray: "gris",
    dark: "oscuro",
    banana: "plátano",
    strawberry: "fresa",
    peanut: "cacahuete",
    "high-contrast-black": "negro de alto contraste",
    "high-contrast-inverse": "inverso de alto contraste",
  },
  footer: {
    text: "Construido con el framework Reynard • SolidJS • Amor",
  },
};
```

#### `src/translations/fr.ts`

```tsx
/**
 * French translations for Basic Todo App
 */

export const fr = {
  app: {
    title: "Application de Tâches",
    subtitle: "Une application simple de tâches construite avec le framework Reynard",
  },
  todo: {
    placeholder: "Que faut-il faire ?",
    addButton: "Ajouter une Tâche",
    completed: "terminées",
    empty: "Aucune tâche pour le moment. Ajoutez-en une ci-dessus ! ✨",
    added: 'Ajouté : "{text}"',
    deleted: 'Supprimé : "{text}"',
  },
  theme: {
    current: "Thème actuel : {theme}",
    switchTo: "Actuel : {theme}",
    light: "clair",
    gray: "gris",
    dark: "sombre",
    banana: "banane",
    strawberry: "fraise",
    peanut: "cacahuète",
    "high-contrast-black": "noir à contraste élevé",
    "high-contrast-inverse": "inverse à contraste élevé",
  },
  footer: {
    text: "Construit avec le framework Reynard • SolidJS • Amour",
  },
};
```

### Enhanced `src/styles.css` for Todo App

```css
/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

/* App Layout */
.app {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.app-header {
  text-align: center;
  padding: 2rem;
  background-color: var(--secondary-bg);
  border-bottom: 1px solid var(--border-color);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 2.5rem;
}

.app-header p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.header-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.theme-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.app-main {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.todo-container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 8px);
  padding: 1.5rem;
}

/* Todo Styles */
.todo-stats {
  margin-bottom: 1rem;
  text-align: center;
}

.stat {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.add-todo {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 4px);
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-size: 1rem;
}

.todo-input:focus {
  outline: none;
  border-color: var(--accent);
}

.add-button {
  padding: 0.75rem 1rem;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.add-button:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 6px);
  transition: all 0.2s ease;
}

.todo-item:hover {
  background-color: var(--hover-bg);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-checkbox {
  position: relative;
  cursor: pointer;
}

.todo-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  display: block;
  width: 20px;
  height: 20px;
  background-color: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.todo-checkbox input:checked ~ .checkmark {
  background-color: var(--accent);
  border-color: var(--accent);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.todo-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.todo-text {
  flex: 1;
  color: var(--text-primary);
}

.todo-delete {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.todo-delete:hover {
  background-color: var(--danger);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.app-footer {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.theme-toggle {
  padding: 0.5rem 1rem;
  background-color: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--hover-bg);
}

.language-selector {
  padding: 0.5rem;
  background-color: var(--secondary-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .header-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .add-todo {
    flex-direction: column;
  }
}
```

## Step 9: Running Your Application

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

Your application should now be running at `http://localhost:3001` with:

- ✅ **Dynamic theming** - Switch between light, gray, dark, banana,
  strawberry, and peanut themes
- ✅ **Internationalization** - Toggle between English, Spanish, and French
- ✅ **Notifications** - Success and info notifications for todo actions
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Accessibility** - Proper ARIA labels and keyboard navigation
- ✅ **Modular components** - Clean separation of concerns with reusable components
- ✅ **Custom translations** - App-specific translation system with parameter support

## Step 10: Advanced Features

### Adding More Reynard Packages

Reynard's modular architecture allows you to add specialized features as needed:

```bash
# Add chat functionality
pnpm install reynard-chat

# Add AI caption generation
pnpm install reynard-annotating

# Add 3D components
pnpm install reynard-3d

# Add data visualization
pnpm install reynard-charts

# Add authentication
pnpm install reynard-auth

# Add file management
pnpm install reynard-gallery
```

### Using Local Storage Persistence

You can add persistence to your todo app using SolidJS's built-in reactive patterns:

```tsx
import { createSignal } from "solid-js";

const TodoApp: Component = () => {
  // Load from localStorage on initialization
  const [todos, setTodos] = createSignal<Todo[]>(() => {
    const stored = localStorage.getItem("todos");
    return stored ? JSON.parse(stored) : [
      { id: 1, text: "Learn SolidJS", completed: true },
      { id: 2, text: "Try Reynard framework", completed: false },
    ];
  });

  // Save to localStorage whenever todos change
  createEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos()));
  });

  // Rest of your component logic...
};
```

### Installing Additional Reynard Packages

The modular architecture allows you to add specialized features as needed:

```bash
# Add chat functionality
pnpm install reynard-chat

# Add AI caption generation
pnpm install reynard-annotating

# Add 3D components
pnpm install reynard-3d

# Add data visualization
pnpm install reynard-charts

# Add authentication
pnpm install reynard-auth

# Add file management
pnpm install reynard-gallery
```

### Example: Adding Chat Functionality

```tsx
import { ChatProvider, ChatWindow } from "reynard-chat";

const App: Component = () => {
  return (
    <ReynardProvider defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <ChatProvider>
          <TodoApp />
          <ChatWindow />
        </ChatProvider>
      </NotificationsProvider>
    </ReynardProvider>
  );
};
```

## Step 11: Deployment

### Build for Production

```bash
pnpm run build
```

This creates an optimized production build in the `dist` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

```bash
# Add to package.json scripts
"deploy": "pnpm run build && gh-pages -d dist"

# Deploy
pnpm run deploy
```

## 🎯 What You've Learned

This comprehensive tutorial covered:

1. **🦊 Reynard Architecture** - Understanding the modular package ecosystem
   with 40+ specialized packages
2. **🎨 Advanced Theming** - OKLCH color system with 6+ built-in themes
   and smooth transitions
3. **🌍 Internationalization** - Custom translation system with parameter
   support and multiple languages
4. **🔔 Notifications** - Production-ready notification system with
   success/info messaging
5. **📱 Responsive Design** - Mobile-first components with accessibility
   and proper ARIA labels
6. **🎮 Component Library** - Using Reynard's UI primitives (Button, Card)
   and custom components
7. **⚡ State Management** - SolidJS signals, effects, and reactive patterns
   for todo management
8. **🔧 Development Workflow** - Proper project setup with Vite, TypeScript,
   and pnpm
9. **🧩 Modular Components** - Clean separation of concerns with reusable
   TodoItem, AddTodo, ThemeToggle, and LanguageSelector components
10. **📦 Deployment** - Building and deploying production apps to various
    platforms

## 🚀 Next Steps

Now that you have a solid foundation, explore these advanced features:

### Core Packages

- **`reynard-chat`** - Real-time messaging and chat systems
- **`reynard-rag`** - Retrieval-Augmented Generation for intelligent search
- **`reynard-auth`** - Authentication and user management
- **`reynard-gallery`** - File uploads and media management

### AI & ML Integration

- **`reynard-annotating`** - AI-powered caption generation with multiple models
- **`reynard-annotating-joy`** - Multilingual LLM caption generator
- **`reynard-annotating-jtp2`** - Furry artwork tagging specialist
- **`reynard-annotating-florence2`** - General purpose vision model
- **`reynard-annotating-wdv3`** - Danbooru-style tagging system

### Rich Components

- **`reynard-floating-panel`** - Advanced floating panel system with staggered animations
- **`reynard-3d`** - Three.js integration and 3D scenes
- **`reynard-charts`** - Data visualization and analytics
- **`reynard-games`** - Roguelike and puzzle game components
- **`reynard-monaco`** - Code editor integration

### Development Tools

- **`reynard-testing`** - Comprehensive testing utilities
- **`reynard-algorithms`** - Data structures and algorithm primitives
- **`reynard-tools`** - Development and debugging tools

## 📚 Additional Resources

- **[📖 Framework Overview](../README.md)** - Learn about Reynard's architecture
  and evolution
- **[📦 Package Documentation](./packages.md)** - Explore all 40+ available packages
- **[📱 Examples & Templates](./examples.md)** - See real-world applications
- **[📖 API Reference](./api.md)** - Complete API documentation
- **[🚀 Performance Guide](./performance.md)** - Optimization and performance tips
- **[🏗️ Architecture Patterns](./architecture/modularity-patterns.md)** - Advanced
  architectural patterns
- **[🤝 Contributing](./CONTRIBUTING.md)** - How to contribute to Reynard

## 🦊 The Reynard Philosophy

Reynard embodies the "cunning fox" philosophy:

- **🎯 Strategic Agility** - Work with foresight and adaptability, not just speed
- **🧩 Modular Architecture** - Write dependency-light code with clear refactor
  paths
- **🚪 Escape Hatches** - Always leave room for rapid iteration and course
  correction
- **⚡ Efficiency Without Premature Optimization** - Tune algorithms intelligently
- **🛡️ Resilient Design** - Shape code to adapt to unforeseen requirements without
  collapse

---

*Ready to build something amazing? Check out the [Package Documentation](./packages.md)
to explore all available features and start your next project with Reynard!* 🦊

---
