# 🦊 Reynard

> _A cunning SolidJS framework for building modern web applications_

Reynard is a comprehensive SolidJS framework and UI library extracted from battle-tested patterns in production applications. It provides a complete toolkit for building modern, performant, and accessible web applications with elegant theming, modular architecture, and exceptional developer experience.

## 📔 Table of Contents

- [🦊 Reynard](#-reynard)
  - [📔 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🎯 Philosophy](#-philosophy)
  - [📦 Packages](#-packages)
  - [🚀 Quick Start](#-quick-start)
    - [Installation](#installation)
    - [Basic Usage](#basic-usage)
  - [📚 Complete Tutorial: Building Your First Reynard App](#-complete-tutorial-building-your-first-reynard-app)
    - [Step 1: Project Setup](#step-1-project-setup)
      - [Option A: Using the Test App Template](#option-a-using-the-test-app-template)
      - [Option B: Create a New Project](#option-b-create-a-new-project)
    - [Step 2: Basic Project Structure](#step-2-basic-project-structure)
    - [Step 3: Configuration Files](#step-3-configuration-files)
      - [`vite.config.ts`](#viteconfigts)
      - [`tsconfig.json`](#tsconfigjson)
      - [`index.html`](#indexhtml)
    - [Step 4: Theme Setup](#step-4-theme-setup)
      - [`src/themes.css`](#srcthemescss)
    - [Step 5: Application Entry Point](#step-5-application-entry-point)
      - [`src/main.tsx`](#srcmaintsx)
    - [Step 6: Main Application Component](#step-6-main-application-component)
      - [`src/App.tsx`](#srcapptsx)
    - [Step 7: Creating Your First Component](#step-7-creating-your-first-component)
      - [`src/components/ThemeDemo.tsx`](#srccomponentsthemedemotsx)
    - [Step 8: Building a Complete Todo App](#step-8-building-a-complete-todo-app)
      - [Enhanced `src/App.tsx` for Todo App](#enhanced-srcapptsx-for-todo-app)
      - [`src/components/TodoItem.tsx`](#srccomponentstodoitemtsx)
      - [`src/components/AddTodo.tsx`](#srccomponentsaddtodotsx)
      - [`src/components/ThemeToggle.tsx`](#srccomponentsthemetoggletsx)
    - [Step 9: Adding Styles](#step-9-adding-styles)
      - [Enhanced `src/themes.css` with Todo App Styles](#enhanced-srcthemescss-with-todo-app-styles)
    - [Step 10: Running Your Application](#step-10-running-your-application)
    - [Step 11: Advanced Features](#step-11-advanced-features)
      - [Adding Internationalization](#adding-internationalization)
      - [Adding Local Storage Persistence](#adding-local-storage-persistence)
    - [Step 12: Deployment](#step-12-deployment)
      - [Build for Production](#build-for-production)
      - [Deploy to Vercel](#deploy-to-vercel)
      - [Deploy to Netlify](#deploy-to-netlify)
    - [🎯 What You've Learned](#-what-youve-learned)
    - [🚀 Next Steps](#-next-steps)
  - [📚 Package Documentation](#-package-documentation)
    - [@reynard/core](#reynardcore)
      - [Modules](#modules)
      - [Core Composables](#core-composables)
      - [Utilities](#utilities)
      - [Core Example Usage](#core-example-usage)
    - [@reynard/components](#reynardcomponents)
      - [Primitives](#primitives)
      - [Composite Components](#composite-components)
      - [Components Example Usage](#components-example-usage)
    - [@reynard/chat](#reynardchat)
      - [Chat Features](#chat-features)
      - [Chat Components](#chat-components)
      - [Chat Composables](#chat-composables)
      - [Chat Example Usage](#chat-example-usage)
    - [@reynard/rag](#reynardrag)
      - [RAG Features](#rag-features)
      - [RAG Components](#rag-components)
      - [RAG Example Usage](#rag-example-usage)
    - [@reynard/auth](#reynardauth)
      - [Auth Features](#auth-features)
      - [Auth Components](#auth-components)
      - [Auth Composables](#auth-composables)
      - [Auth Example Usage](#auth-example-usage)
    - [@reynard/charts](#reynardcharts)
      - [Chart Types](#chart-types)
      - [Charts Features](#charts-features)
      - [Charts Example Usage](#charts-example-usage)
    - [@reynard/gallery](#reynardgallery)
      - [Gallery Features](#gallery-features)
      - [Gallery Components](#gallery-components)
      - [Gallery Composables](#gallery-composables)
      - [Gallery Example Usage](#gallery-example-usage)
    - [@reynard/settings](#reynardsettings)
      - [Settings Features](#settings-features)
      - [Setting Types](#setting-types)
      - [Settings Components](#settings-components)
      - [Settings Composables](#settings-composables)
      - [Settings Example Usage](#settings-example-usage)
    - [@reynard/algorithms](#reynardalgorithms)
      - [Algorithm Types](#algorithm-types)
      - [Core Features](#core-features)
      - [Algorithms Example Usage](#algorithms-example-usage)
    - [@reynard/file-processing](#reynardfile-processing)
      - [Supported File Types](#supported-file-types)
      - [Core Components](#core-components)
      - [File Processing Example Usage](#file-processing-example-usage)
  - [🎨 Theming System](#-theming-system)
    - [Custom Themes](#custom-themes)
  - [📱 Examples and Templates](#-examples-and-templates)
    - [Examples](#examples)
    - [Templates](#templates)
    - [Running Examples](#running-examples)
  - [🧪 Testing](#-testing)
    - [Test Coverage](#test-coverage)
  - [🚀 Performance](#-performance)
    - [Bundle Sizes](#bundle-sizes)
  - [♿ Accessibility](#-accessibility)
  - [🌍 Internationalization](#-internationalization)
  - [🛠️ Development Tools](#️-development-tools)
    - [CLI Tools](#cli-tools)
    - [VS Code Extension](#vs-code-extension)
  - [📖 API Reference](#-api-reference)
    - [Core API](#core-api)
    - [Component API](#component-api)
  - [🧪 Development](#-development)
  - [🤝 Contributing](#-contributing)
    - [Development Setup](#development-setup)
    - [Code Style](#code-style)
  - [📄 License](#-license)
  - [🙏 Acknowledgments](#-acknowledgments)
  - [📞 Support](#-support)

## ✨ Features

Reynard offers a modular architecture, with each module designed to be slim with dependencies and concise—typically under 100 lines—making the framework both approachable and maintainable. The theming system is comprehensive, providing eight built-in themes and full support for custom themes, so you can tailor your application's look and feel with ease. Testing is a first-class citizen, with Vitest and Playwright integration ensuring 95%+ coverage out of the box. Accessibility is prioritized, with WCAG compliance and a robust set of a11y features. Performance is optimized through bundle splitting and lazy loading, while responsive design is achieved using a mobile-first approach and container queries. Internationalization (i18n) is built in, enabling multi-language support from the start. For developers, Reynard includes a CLI, a VS Code extension, and a suite of debugging utilities to streamline your workflow.

## 🎯 Philosophy

Reynard is guided by the "cunning fox" philosophy. The framework values smart, elegant solutions over unnecessary complexity, aiming to be adaptable so it can integrate seamlessly with your existing patterns. It is resourceful, minimizing dependencies while maximizing functionality, and maintains a professional standard with high expectations for code quality and naming conventions.

## 📦 Packages

| Package                    | Description                        | Version |
| -------------------------- | ---------------------------------- | ------- |
| `@reynard/core`            | Core framework and utilities       | `0.1.0` |
| `@reynard/components`      | UI component library               | `0.1.0` |
| `@reynard/chat`            | Chat system and messaging          | `0.1.0` |
| `@reynard/rag`             | RAG search and retrieval           | `0.1.0` |
| `@reynard/auth`            | Authentication and user management | `0.1.0` |
| `@reynard/charts`          | Data visualization components      | `0.1.0` |
| `@reynard/gallery`         | File and media management          | `0.1.0` |
| `@reynard/settings`        | Configuration management           | `0.1.0` |
| `@reynard/file-processing` | Advanced file processing pipeline  | `0.1.0` |
| `@reynard/algorithms`      | Algorithm primitives and data structures | `0.1.0` |
| `@reynard/color-media`     | Color and media utilities          | `0.1.0` |
| `@reynard/ui`              | Additional UI components           | `0.1.0` |
| `@reynard/themes`          | Theme system and built-in themes   | `0.1.0` |
| `@reynard/testing`         | Testing utilities and helpers      | `0.1.0` |
| `@reynard/tools`           | Development tools and CLI          | `0.1.0` |

## 🚀 Quick Start

### Installation

```bash
# Install core package
npm install @reynard/core solid-js

# Install additional packages as needed
npm install @reynard/components @reynard/chat @reynard/rag @reynard/auth @reynard/charts
```

### Basic Usage

```tsx
import { createSignal } from "solid-js";
import { useTheme, useNotifications } from "@reynard/core";
import { Button, Card } from "@reynard/components";

function App() {
  const { theme, setTheme } = useTheme();
  const { notify } = useNotifications();

  const handleClick = () => {
    notify("Hello from Reynard!", "success");
    setTheme(theme() === "light" ? "dark" : "light");
  };

  return (
    <Card padding="lg">
      <h1>Welcome to Reynard!</h1>
      <Button variant="primary" onClick={handleClick}>
        Toggle Theme
      </Button>
    </Card>
  );
}
```

## 📚 Complete Tutorial: Building Your First Reynard App

This comprehensive tutorial will guide you through creating a complete application with Reynard, from setup to deployment.

### Step 1: Project Setup

#### Option A: Using the Test App Template

The easiest way to get started is with the included test app:

```bash
# Navigate to the test app directory
cd reynard-test-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3001` to see the basic Reynard setup in action.

#### Option B: Create a New Project

```bash
# Create a new directory
mkdir my-reynard-app
cd my-reynard-app

# Initialize package.json
npm init -y

# Install dependencies
npm install @reynard/core @reynard/components @reynard/chat @reynard/rag solid-js
npm install -D vite vite-plugin-solid typescript @types/node
```

### Step 2: Basic Project Structure

Create the following file structure:

```plaintext
my-reynard-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── themes.css
    └── components/
        └── (your components)
```

### Step 3: Configuration Files

#### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
  },
});
```

#### `tsconfig.json`

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

#### `index.html`

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

### Step 4: Theme Setup

#### `src/themes.css`

```css
/* Light Theme (Default) */
:root {
  --accent: hsl(270deg 60% 60%);
  --bg-color: hsl(220deg 20% 95%);
  --secondary-bg: hsl(220deg 15% 90%);
  --card-bg: hsl(220deg 15% 85%);
  --text-primary: hsl(240deg 15% 12%);
  --text-secondary: hsl(240deg 10% 45%);
  --border-color: hsl(220deg 15% 75%);
  --success: hsl(140deg 60% 45%);
  --warning: hsl(45deg 70% 50%);
  --danger: hsl(0deg 70% 50%);
  --info: hsl(200deg 60% 50%);
}

/* Dark Theme */
:root[data-theme="dark"] {
  --accent: hsl(270deg 60% 70%);
  --bg-color: hsl(220deg 15% 8%);
  --secondary-bg: hsl(220deg 15% 12%);
  --card-bg: hsl(220deg 15% 16%);
  --text-primary: hsl(220deg 20% 95%);
  --text-secondary: hsl(220deg 15% 70%);
  --border-color: hsl(220deg 15% 24%);
}

/* Additional themes... */
:root[data-theme="banana"] {
  --accent: hsl(45deg 100% 45%);
  --bg-color: hsl(50deg 40% 95%);
  --text-primary: hsl(30deg 15% 15%);
  /* ... more theme variables */
}
```

### Step 5: Application Entry Point

#### `src/main.tsx`

```tsx
import { render } from "solid-js/web";
import "./themes.css";
import App from "./App";

render(() => <App />, document.getElementById("root")!);
```

### Step 6: Main Application Component

#### `src/App.tsx`

```tsx
import { ThemeProvider, createTheme } from "@reynard/core";
import { ThemeDemo } from "./components/ThemeDemo";

function App() {
  const themeModule = createTheme();

  return (
    <ThemeProvider value={themeModule}>
      <div style="min-height: 100vh; background-color: var(--bg-color); color: var(--text-primary); transition: all 0.2s ease;">
        <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h1 style="margin-bottom: 1rem; color: var(--text-primary);">
            Welcome to Reynard
          </h1>
          <p style="margin-bottom: 2rem; color: var(--text-secondary);">
            This is your first Reynard application!
          </p>
          <ThemeDemo />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### Step 7: Creating Your First Component

#### `src/components/ThemeDemo.tsx`

```tsx
import { Button, Card } from "@reynard/components";
import { useTheme } from "@reynard/core";

export function ThemeDemo() {
  const { theme, setTheme, nextTheme } = useTheme();

  return (
    <Card style="padding: 1.5rem;">
      <h3 style="margin: 0 0 1rem 0; color: var(--text-primary);">
        Theme Demo Component
      </h3>
      <p style="margin: 0 0 1.5rem 0; color: var(--text-secondary);">
        Current theme: <strong style="color: var(--accent);">{theme()}</strong>
      </p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={() => setTheme("banana")}>Banana</Button>
        <Button onClick={() => setTheme("strawberry")}>Strawberry</Button>
      </div>
      <Button onClick={nextTheme} style="width: 100%;">
        Next Theme
      </Button>
    </Card>
  );
}
```

### Step 8: Building a Complete Todo App

Let's build a more comprehensive example - a todo application that demonstrates multiple Reynard features.

#### Enhanced `src/App.tsx` for Todo App

```tsx
import { Component, createSignal, For, createEffect } from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  createTheme,
  createNotifications,
  useTheme,
  useNotifications,
} from "@reynard/core";
import { Button, Card } from "@reynard/components";
import { TodoItem } from "./components/TodoItem";
import { AddTodo } from "./components/AddTodo";
import { ThemeToggle } from "./components/ThemeToggle";
import "./themes.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: Component = () => {
  const [todos, setTodos] = createSignal<Todo[]>([
    { id: 1, text: "Learn SolidJS", completed: true },
    { id: 2, text: "Try Reynard framework", completed: false },
    { id: 3, text: "Build something awesome", completed: false },
  ]);
  const [nextId, setNextId] = createSignal(4);
  const { theme } = useTheme();
  const { notify } = useNotifications();

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: nextId(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setNextId((prev) => prev + 1);
    notify(`Added: ${text}`, "success");
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
      notify(`Deleted: ${todo.text}`, "info");
    }
  };

  const completedCount = () => todos().filter((todo) => todo.completed).length;
  const totalCount = () => todos().length;

  return (
    <div class="app">
      <header class="app-header">
        <h1>🦊 Reynard Todo App</h1>
        <p>Built with SolidJS and Reynard framework</p>
        <div class="header-controls">
          <div class="theme-info">Current theme: {theme()}</div>
          <ThemeToggle />
        </div>
      </header>

      <main class="app-main">
        <Card style="padding: 1.5rem;">
          <div class="todo-stats">
            <span class="stat">
              {completedCount()} / {totalCount()} completed
            </span>
          </div>

          <AddTodo onAdd={addTodo} />

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
                <p>No todos yet. Add one above!</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

const App: Component = () => {
  const themeModule = createTheme();
  const notificationsModule = createNotifications();

  return (
    <ThemeProvider value={themeModule}>
      <NotificationsProvider value={notificationsModule}>
        <TodoApp />
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default App;
```

#### `src/components/TodoItem.tsx`

```tsx
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
          onChange={props.onToggle}
          aria-label={`Mark "${props.todo.text}" as ${props.todo.completed ? "incomplete" : "complete"}`}
        />
        <span class="checkmark"></span>
      </label>

      <span class="todo-text">{props.todo.text}</span>

      <button class="todo-delete" onClick={props.onDelete} title="Delete todo">
        ×
      </button>
    </div>
  );
};
```

#### `src/components/AddTodo.tsx`

```tsx
import { Component, createSignal } from "solid-js";

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export const AddTodo: Component<AddTodoProps> = (props) => {
  const [input, setInput] = createSignal("");

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
        placeholder="Add a new todo..."
        value={input()}
        onInput={(e) => setInput(e.currentTarget.value)}
      />
      <Button type="submit" disabled={!input().trim()}>
        Add Todo
      </Button>
    </form>
  );
};
```

#### `src/components/ThemeToggle.tsx`

```tsx
import { Component } from "solid-js";
import { Button } from "@reynard/components";
import { useTheme } from "@reynard/core";

export const ThemeToggle: Component = () => {
  const { theme, nextTheme } = useTheme();

  const getThemeEmoji = (theme: string) => {
    switch (theme) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "banana":
        return "🍌";
      case "strawberry":
        return "🍓";
      case "peanut":
        return "🥜";
      default:
        return "🎨";
    }
  };

  return (
    <Button
      onClick={nextTheme}
      style="display: flex; align-items: center; gap: 0.5rem;"
    >
      {getThemeEmoji(theme())} {theme()}
    </Button>
  );
};
```

### Step 9: Adding Styles

#### Enhanced `src/themes.css` with Todo App Styles

```css
/* ... existing theme variables ... */

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
}

.app-header p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
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

.todo-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius, 6px);
  background-color: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
}

.todo-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent) 20;
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

.todo-delete {
  background: none;
  border: none;
  color: var(--danger);
  font-size: 1.5rem;
  cursor: pointer;
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

### Step 10: Running Your Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Step 11: Advanced Features

#### Adding Internationalization

```tsx
import { I18nProvider, createI18nModule, useI18n } from "@reynard/core";

// In your App component
const i18nModule = createI18nModule({
  locale: "en",
  translations: {
    en: {
      "app.title": "Todo App",
      "todo.add": "Add Todo",
      "todo.placeholder": "What needs to be done?",
    },
    es: {
      "app.title": "Aplicación de Tareas",
      "todo.add": "Agregar Tarea",
      "todo.placeholder": "¿Qué necesita hacerse?",
    },
  },
});

// Wrap your app
<I18nProvider value={i18nModule}>
  <TodoApp />
</I18nProvider>;
```

#### Adding Local Storage Persistence

```tsx
import { useLocalStorage } from "@reynard/core";

const TodoApp: Component = () => {
  const [todos, setTodos] = useLocalStorage("todos", [
    { id: 1, text: "Learn SolidJS", completed: true },
    { id: 2, text: "Try Reynard framework", completed: false },
  ]);

  // Todos will automatically persist to localStorage
  // and restore on page reload
};
```

### Step 12: Deployment

#### Build for Production

```bash
npm run build
```

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### 🎯 What You've Learned

This tutorial covered:

1. **Project Setup** - Creating a new Reynard application
2. **Theme System** - Setting up and using Reynard's theming
3. **Component Architecture** - Building reusable components
4. **State Management** - Using SolidJS signals for reactive state
5. **Event Handling** - Form submission and user interactions
6. **Styling** - CSS custom properties and responsive design
7. **Notifications** - User feedback with toast notifications
8. **Internationalization** - Multi-language support
9. **Persistence** - Local storage integration
10. **Deployment** - Building and deploying your app

### 🚀 Next Steps

Now that you have a solid foundation, try:

- **Adding Chat Features** - Use `@reynard/chat` for messaging and real-time communication
- **Implementing RAG Search** - Add intelligent search with `@reynard/rag`
- **Adding Authentication** - Use `@reynard/auth` for user management
- **Data Visualization** - Add charts with `@reynard/charts`
- **File Management** - Implement file uploads with `@reynard/gallery`
- **Advanced Settings** - Add configuration with `@reynard/settings`
- **Real-time Features** - WebSocket integration for live updates
- **Progressive Web App** - Add PWA capabilities
- **Testing** - Write unit and integration tests
- **Performance** - Optimize bundle size and loading

## 📚 Package Documentation

### @reynard/core

The foundation of the Reynard framework, providing essential utilities, composables, and modules.

#### Modules

- **Theme System** - Comprehensive theming with 8 built-in themes and custom theme support
- **Notifications** - Toast notification system with auto-dismiss and multiple types
- **Internationalization** - Built-in i18n support with translation management

#### Core Composables

- **`useTheme()`** - Theme management with persistence and reactive switching
- **`useNotifications()`** - Toast notification system with queue management
- **`useLocalStorage()`** - Reactive local storage with type safety
- **`useDebounce()`** - Debounced values for performance optimization
- **`useMediaQuery()`** - Responsive breakpoint detection
- **`useI18n()`** - Internationalization with reactive translations

#### Utilities

- **Date Utilities** - Comprehensive date formatting and manipulation
- **Formatters** - Text, number, and currency formatting functions
- **Validation** - Input validation and sanitization utilities

#### Core Example Usage

```tsx
import {
  useTheme,
  useNotifications,
  useLocalStorage,
  useDebounce,
} from "@reynard/core";

function MyComponent() {
  const { theme, setTheme, nextTheme } = useTheme();
  const { notify } = useNotifications();
  const [count, setCount] = useLocalStorage("counter", 0);
  const [searchTerm, setSearchTerm] = useDebounce("", 300);

  return (
    <div>
      <button onClick={() => setTheme("dark")}>Switch to Dark Theme</button>
      <button onClick={() => notify("Success!", "success")}>
        Show Notification
      </button>
    </div>
  );
}
```

### @reynard/components

Production-ready SolidJS component library with comprehensive theming and accessibility support.

#### Primitives

- **Button** - Versatile button with multiple variants, sizes, and states
- **Card** - Flexible container with consistent styling and variants
- **TextField** - Text input with validation, icons, and error states
- **Select** - Dropdown select with options and search support

#### Composite Components

- **Modal** - Flexible modal dialog with backdrop and animations
- **Tabs** - Tab navigation with keyboard support and accessibility

#### Components Example Usage

```tsx
import {
  Button,
  Card,
  TextField,
  Modal,
  Tabs,
} from "@reynard/components";
import { ChatContainer } from "@reynard/chat";

function MyApp() {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("tab1");

  return (
    <div>
      <Card padding="lg">
        <TextField label="Email" type="email" placeholder="Enter your email" />
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Open Modal
        </Button>
      </Card>

      <Modal
        open={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p>Modal content goes here</p>
      </Modal>

      <Tabs
        activeTab={activeTab()}
        onTabChange={setActiveTab}
        tabs={[
          { id: "tab1", label: "Overview" },
          { id: "tab2", label: "Details" },
        ]}
      >
        <div slot="tab1">Overview content</div>
        <div slot="tab2">Details content</div>
      </Tabs>

      <ChatContainer
        endpoint="/api/chat"
        height="600px"
        config={{
          enableThinking: true,
          enableTools: true,
          showTimestamps: true,
        }}
      />
    </div>
  );
}
```

### @reynard/chat

Production-ready chat messaging system for SolidJS applications with advanced streaming capabilities, markdown parsing, thinking sections, and tool integration.

#### Chat Features

- **Real-time Streaming** - Advanced streaming text processing with real-time markdown rendering
- **Thinking Sections** - Support for AI assistant thinking process visualization
- **Tool Integration** - Complete tool calling system with progress tracking
- **Markdown Parsing** - Full markdown support including tables, code blocks, and math
- **P2P Support** - Peer-to-peer chat capabilities with WebRTC
- **TypeScript First** - Complete type safety with excellent IntelliSense

#### Chat Components

- **ChatContainer** - Main chat interface with message display and input handling
- **ChatMessage** - Individual message component with markdown rendering
- **MessageInput** - Text input with send functionality and keyboard shortcuts
- **P2PChatContainer** - Peer-to-peer chat interface with user management
- **ThinkingIndicator** - Visual indicator for AI thinking processes
- **ToolCallDisplay** - Display component for tool call results and progress

#### Chat Composables

- **`useChat()`** - Main chat state management with streaming support
- **`useP2PChat()`** - Peer-to-peer chat functionality with WebRTC

#### Chat Example Usage

```tsx
import { ChatContainer, P2PChatContainer } from "@reynard/chat";

function ChatApp() {
  return (
    <div>
      <ChatContainer
        endpoint="/api/chat"
        height="600px"
        config={{
          enableThinking: true,
          enableTools: true,
          showTimestamps: true,
        }}
        onMessageSent={(message) => console.log("Sent:", message)}
        onMessageReceived={(message) => console.log("Received:", message)}
      />
      
      <P2PChatContainer
        currentUser={{ id: "user1", name: "Alice", status: "online" }}
        realtimeEndpoint="ws://localhost:8080"
        config={{
          enableTyping: true,
          enablePresence: true,
        }}
      />
    </div>
  );
}
```

### @reynard/rag

RAG (Retrieval-Augmented Generation) system for SolidJS applications with EmbeddingGemma integration and comprehensive search capabilities.

#### RAG Features

- **Advanced Search Interface** - Comprehensive search UI with filtering and sorting
- **EmbeddingGemma Integration** - Built-in support for EmbeddingGemma models
- **Real-time Results** - Live search results with similarity scoring
- **Metadata Support** - Rich metadata display and filtering
- **TypeScript First** - Complete type safety with excellent IntelliSense

#### RAG Components

- **RAGSearch** - Main search interface with query input and result display
- **SearchFilters** - Advanced filtering options for search results
- **ResultCard** - Individual search result display with metadata
- **SimilarityIndicator** - Visual similarity score display

#### RAG Example Usage

```tsx
import { RAGSearch } from "@reynard/rag";

function RAGApp() {
  return (
    <RAGSearch
      endpoint="/api/rag/search"
      height="600px"
      config={{
        enableFilters: true,
        showMetadata: true,
        maxResults: 20,
        similarityThreshold: 0.7,
      }}
      onSearch={(query) => console.log("Searching:", query)}
      onResultClick={(result) => console.log("Selected:", result)}
    />
  );
}
```

### @reynard/auth

Complete authentication and user management system with JWT tokens, password strength analysis, and comprehensive security features.

#### Auth Features

- **JWT Authentication** - Complete token-based authentication with refresh tokens
- **Login & Registration** - Ready-to-use forms with validation and error handling
- **Password Security** - Advanced password strength analysis using zxcvbn
- **User Management** - Profile management, password changes, and user preferences
- **Security** - Automatic token refresh, secure storage, and CSRF protection

#### Auth Components

- **AuthProvider** - Context provider for authentication state and methods
- **LoginForm** - Complete login form with validation
- **RegisterForm** - Registration form with password strength analysis
- **ProfileForm** - User profile management form
- **PasswordChangeForm** - Secure password change form

#### Auth Composables

- **`useAuth()`** - Main authentication hook with state management and API integration
- **`useAuthContext()`** - Access authentication context
- **`withAuth()`** - Higher-order component for authentication requirements

#### Auth Example Usage

```tsx
import {
  AuthProvider,
  LoginForm,
  RegisterForm,
  useAuthContext,
} from "@reynard/auth";

function App() {
  return (
    <AuthProvider
      config={{
        apiUrl: "/api/auth",
        tokenStorageKey: "auth_token",
        refreshTokenStorageKey: "refresh_token",
      }}
    >
      <AuthApp />
    </AuthProvider>
  );
}

function AuthApp() {
  const { isAuthenticated, user, login, logout } = useAuthContext();

  return (
    <div>
      {isAuthenticated() ? (
        <div>
          <p>Welcome, {user()?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <LoginForm onSuccess={() => console.log("Logged in!")} />
          <RegisterForm onSuccess={() => console.log("Registered!")} />
        </div>
      )}
    </div>
  );
}
```

### @reynard/charts

Advanced data visualization components built on Chart.js with real-time updates and comprehensive theming.

#### Chart Types

- **LineChart** - Perfect for showing trends over time or continuous data
- **BarChart** - Ideal for comparing categories or showing discrete data
- **PieChart** - Great for showing proportions and percentages
- **TimeSeriesChart** - Advanced real-time chart with automatic data management

#### Charts Features

- **Real-time Updates** - Live data streaming with automatic management
- **Theme Integration** - Seamlessly works with Reynard's theming system
- **Responsive Design** - Charts adapt to container size and mobile devices
- **Performance** - Optimized rendering with data aggregation and limits
- **Accessibility** - Screen reader friendly with proper ARIA labels

#### Charts Example Usage

```tsx
import {
  LineChart,
  BarChart,
  PieChart,
  TimeSeriesChart,
} from "@reynard/charts";

function Dashboard() {
  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2],
      },
    ],
  };

  const performanceData = [
    { timestamp: Date.now() - 300000, value: 45, label: "5 min ago" },
    { timestamp: Date.now() - 240000, value: 52, label: "4 min ago" },
    { timestamp: Date.now() - 180000, value: 38, label: "3 min ago" },
    { timestamp: Date.now() - 120000, value: 67, label: "2 min ago" },
    { timestamp: Date.now() - 60000, value: 74, label: "1 min ago" },
    { timestamp: Date.now(), value: 82, label: "Now" },
  ];

  return (
    <div
      style={{
        display: "grid",
        "grid-template-columns": "1fr 1fr",
        gap: "2rem",
      }}
    >
      <LineChart
        title="Sales Trend"
        labels={salesData.labels}
        datasets={salesData.datasets}
        yAxis={{ label: "Sales ($)" }}
        responsive
      />

      <TimeSeriesChart
        title="Real-time Performance"
        data={performanceData}
        autoScroll
        maxDataPoints={50}
        valueFormatter={(value) => `${value}%`}
      />
    </div>
  );
}
```

### @reynard/gallery

Advanced file and media management system with drag-and-drop, responsive grids, and comprehensive file handling.

#### Gallery Features

- **File Management** - Complete file browser with folder navigation
- **Media Support** - Images, videos, audio, text, and document preview
- **Responsive Grid** - Adaptive layouts (grid, list, masonry) with virtual scrolling
- **File Upload** - Drag-and-drop upload with progress tracking and validation
- **Search & Filter** - Real-time search with advanced filtering options
- **Favorites** - Mark files as favorites with persistent storage
- **Selection** - Multi-select with keyboard shortcuts and context menus

#### Gallery Components

- **Gallery** - Main gallery component with navigation and management
- **GalleryGrid** - Responsive grid layout with virtual scrolling
- **ImageViewer** - Sophisticated image viewer with zoom, pan, and navigation
- **FileUploadZone** - Drag-and-drop file upload with progress tracking
- **BreadcrumbNavigation** - Folder navigation breadcrumbs

#### Gallery Composables

- **`useGalleryState()`** - Gallery state management with persistence
- **`useFileUpload()`** - File upload handling with progress tracking
- **`useMultiSelect()`** - Multi-selection system with keyboard shortcuts

#### Gallery Example Usage

```tsx
import { Gallery } from "@reynard/gallery";
import type { GalleryData } from "@reynard/gallery";

function FileManager() {
  const [galleryData, setGalleryData] = createSignal<GalleryData>({
    files: [
      { id: "1", name: "document.pdf", type: "file", size: 1024 },
      { id: "2", name: "image.jpg", type: "file", size: 2048 },
    ],
    folders: [{ id: "3", name: "Documents", type: "folder" }],
    currentPath: "/",
    breadcrumbs: [{ name: "Home", path: "/" }],
  });

  return (
    <Gallery
      data={galleryData()}
      onFileSelect={(file) => console.log("Selected:", file)}
      onFolderNavigate={(path) => console.log("Navigate to:", path)}
      onFileUpload={(files) => console.log("Upload:", files)}
      showUpload={true}
      showBreadcrumbs={true}
      enableDragAndDrop={true}
    />
  );
}
```

### @reynard/settings

Comprehensive configuration management system with validation, persistence, and UI components.

#### Settings Features

- **Settings Schema** - Type-safe settings definitions with validation
- **Multiple Storage** - localStorage, sessionStorage, IndexedDB, and remote storage
- **Validation** - Comprehensive validation with custom rules
- **Migration** - Automatic settings migration between versions
- **Backup** - Automatic backup and restore functionality
- **Categories** - Organized settings with categories and search

#### Setting Types

- **Boolean** - Toggle switches and checkboxes
- **String** - Text inputs with validation
- **Number** - Numeric inputs with min/max constraints
- **Select** - Dropdown selections with options
- **MultiSelect** - Multiple selection with tags
- **Range** - Slider inputs with min/max values
- **Color** - Color picker inputs
- **File** - File upload inputs
- **JSON** - JSON object inputs with validation

#### Settings Components

- **SettingsPanel** - Complete settings interface with categories and search
- **SettingControl** - Individual setting control components
- **SettingsProvider** - Context provider for settings management

#### Settings Composables

- **`useSettings()`** - Main settings management hook
- **`useSetting()`** - Individual setting management
- **`useSettingsValidation()`** - Settings validation utilities

#### Settings Example Usage

```tsx
import {
  SettingsPanel,
  SettingsProvider,
  useSettings,
} from "@reynard/settings";

const settingsSchema = {
  appearance: {
    theme: {
      key: "appearance.theme",
      label: "Theme",
      type: "select",
      defaultValue: "light",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
    },
  },
  behavior: {
    autoSave: {
      key: "behavior.autoSave",
      label: "Auto Save",
      type: "boolean",
      defaultValue: true,
    },
  },
};

function App() {
  return (
    <SettingsProvider config={{ schema: settingsSchema }}>
      <SettingsPanel
        title="Application Settings"
        showSearch={true}
        showCategories={true}
        showImportExport={true}
      />
    </SettingsProvider>
  );
}
```

### @reynard/algorithms

Algorithm primitives and data structures for efficient spatial operations, performance monitoring, and geometric calculations.

#### Algorithm Types

- **Union-Find Algorithm** - Efficient set operations and cycle detection with path compression
- **AABB Collision Detection** - Spatial queries and overlap detection with spatial hashing support
- **Spatial Hashing** - Efficient spatial partitioning and nearest neighbor searches
- **Performance Utilities** - Benchmarking, profiling, and monitoring tools
- **Geometry Operations** - 2D geometric calculations and transformations

#### Core Features

- **High Performance** - Optimized algorithms with O(α(n)) Union-Find and O(1) collision detection
- **Memory Efficient** - Minimal memory overhead with automatic cleanup and optimization
- **Type Safe** - Full TypeScript support with comprehensive type definitions
- **Framework Agnostic** - Pure algorithms that work with any JavaScript framework

#### Algorithms Example Usage

```tsx
import {
  UnionFind,
  detectCycle,
  checkCollision,
  SpatialHash,
  PerformanceTimer,
  PointOps,
  VectorOps,
} from "@reynard/algorithms";

function AlgorithmDemo() {
  // Union-Find for connected components
  const uf = new UnionFind(10);
  uf.union(0, 1);
  uf.union(1, 2);
  console.log(uf.connected(0, 2)); // true

  // Collision detection
  const aabb1 = { x: 0, y: 0, width: 100, height: 100 };
  const aabb2 = { x: 50, y: 50, width: 100, height: 100 };
  const collision = checkCollision(aabb1, aabb2);
  console.log(collision.colliding); // true

  // Spatial hashing
  const spatialHash = new SpatialHash({ cellSize: 100 });
  spatialHash.insert({ id: '1', x: 50, y: 50, data: { name: 'object1' } });
  const nearby = spatialHash.queryRadius(0, 0, 100);

  // Performance monitoring
  const timer = new PerformanceTimer();
  timer.start();
  // ... perform operation
  const duration = timer.stop();

  // Geometry operations
  const point1 = PointOps.create(0, 0);
  const point2 = PointOps.create(3, 4);
  const distance = PointOps.distance(point1, point2); // 5

  return <div>Algorithm demo running...</div>;
}
```

### @reynard/file-processing

Advanced file processing pipeline with thumbnail generation, metadata extraction, and comprehensive file type support.

#### Supported File Types

- **Images** - JPG, PNG, GIF, WebP, BMP, TIFF, JXL, AVIF, HEIC, HEIF, JP2, SVG, EPS, AI, CDR, RAW formats
- **Videos** - MP4, AVI, MOV, MKV, WebM, FLV, WMV, MPG, MPEG, TS, MTS, M2TS, ProRes, DNxHD, Cine, R3D, BRAW
- **Audio** - MP3, AAC, OGG, WMA, Opus, WAV, FLAC, ALAC, APE, WV, DSD, DFF, DSF
- **Text & Code** - TXT, MD, RST, TEX, LOG, JSON, XML, YAML, TOML, CSV, TSV, Parquet, Arrow, Feather, HDF5, NumPy, and programming languages
- **Documents** - PDF, DOCX, PPTX, XLSX, ODT, ODP, ODS, EPUB, MOBI, AZW3, KFX, RTF, Pages, Key, Numbers
- **LoRA Models** - SafeTensors, Checkpoint, PyTorch, ONNX, Bin

#### Core Components

- **ThumbnailGenerator** - Multi-format thumbnail generation with smart rendering
- **MetadataExtractor** - Comprehensive metadata extraction and analysis
- **ContentAnalyzer** - Content analysis and processing utilities
- **ProgressTracker** - Progress tracking and callback system

#### File Processing Example Usage

```tsx
import {
  ThumbnailGenerator,
  MetadataExtractor,
  useFileProcessing,
} from "@reynard/file-processing";

function FileProcessor() {
  const { generateThumbnail, extractMetadata } = useFileProcessing();

  const handleFileUpload = async (file: File) => {
    // Generate thumbnail
    const thumbnail = await generateThumbnail(file, {
      width: 200,
      height: 200,
      quality: 0.8,
    });

    // Extract metadata
    const metadata = await extractMetadata(file);

    console.log("Thumbnail:", thumbnail);
    console.log("Metadata:", metadata);
  };

  return (
    <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
  );
}
```

## 🎨 Theming System

Reynard includes a comprehensive theming system with 8 built-in themes:

- **Light** - Clean and bright
- **Dark** - Easy on the eyes
- **Gray** - Professional neutral
- **Banana** - Warm and cheerful
- **Strawberry** - Vibrant and energetic
- **Peanut** - Earthy and cozy
- **High Contrast Black** - Maximum accessibility
- **High Contrast Inverse** - Alternative high contrast

### Custom Themes

Create custom themes by extending the base theme configuration:

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

## 📱 Examples and Templates

### Examples

- **Basic App** - Minimal todo application demonstrating core features
- **Multi-Theme Gallery** - Advanced theming showcase with component library
- **Chat Demo** - Complete chat application with streaming, P2P, and tool integration
- **Comprehensive Dashboard** - Full-featured dashboard with charts and settings
- **Full-Stack App** - Complete application with backend integration _(Coming Soon)_

### Templates

- **Starter Template** - Basic application template with essential features
- **Dashboard Template** - Dashboard-focused template with charts and analytics
- **Portfolio Template** - Portfolio website template with gallery and contact forms

### Running Examples

```bash
# Navigate to any example directory
cd examples/basic-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🧪 Testing

Reynard includes comprehensive testing with Vitest and Playwright:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests in UI mode
npm test:ui

# Run Playwright tests
npm run test:e2e
```

### Test Coverage

- **Core Tests** - All core functionality tests are passing (200+ tests)
- **Component Tests** - Comprehensive component testing with user interactions
- **Integration Tests** - End-to-end testing with Playwright
- **Accessibility Tests** - Automated accessibility testing

## 🚀 Performance

Reynard is optimized for performance:

- **Bundle Splitting** - Automatic code splitting and lazy loading
- **Tree Shaking** - Import only what you need
- **Optimized Builds** - Production builds with minification and compression
- **Virtual Scrolling** - Efficient rendering of large lists
- **Memory Management** - Smart cleanup and garbage collection

### Bundle Sizes

- **@reynard/core** - ~15 kB (3.2 kB gzipped)
- **@reynard/components** - ~45 kB (12.1 kB gzipped)
- **@reynard/chat** - ~110 kB (25.1 kB gzipped)
- **@reynard/rag** - ~22 kB (5.7 kB gzipped)
- **@reynard/auth** - ~28 kB (7.8 kB gzipped)
- **@reynard/charts** - ~27 kB (5.4 kB gzipped)
- **@reynard/gallery** - ~52 kB (14.2 kB gzipped)
- **@reynard/settings** - ~31 kB (8.9 kB gzipped)

## ♿ Accessibility

Reynard prioritizes accessibility:

- **WCAG 2.1 Compliance** - Meets AA standards
- **Screen Reader Support** - Proper ARIA labels and descriptions
- **Keyboard Navigation** - Full keyboard accessibility
- **High Contrast Support** - Built-in high contrast themes
- **Focus Management** - Proper focus handling and management

## 🌍 Internationalization

Built-in i18n support with:

- **Translation Management** - Easy translation file management
- **Reactive Translations** - Automatic re-rendering on language changes
- **Pluralization** - Proper plural form handling
- **Date/Number Formatting** - Locale-aware formatting
- **RTL Support** - Right-to-left language support

## 🛠️ Development Tools

### CLI Tools

```bash
# Create new Reynard project
npx @reynard/cli create my-app

# Generate component
npx @reynard/cli generate component MyComponent

# Build and analyze bundle
npx @reynard/cli build --analyze
```

### VS Code Extension

The Reynard VS Code extension provides:

- **IntelliSense** - Enhanced autocomplete and type checking
- **Snippets** - Code snippets for common patterns
- **Debugging** - Integrated debugging support
- **Theming** - Syntax highlighting for Reynard components

## 📖 API Reference

### Core API

```tsx
// Theme management
const { theme, setTheme, nextTheme } = useTheme();

// Notifications
const { notify, dismiss, clear } = useNotifications();

// Local storage
const [value, setValue] = useLocalStorage("key", defaultValue);

// Debounced values
const [debouncedValue] = useDebounce(value, delay);

// Media queries
const isMobile = useMediaQuery("(max-width: 768px)");

// Internationalization
const { t, locale, setLocale } = useI18n();
```

### Component API

```tsx
// Button variants
<Button variant="primary" size="lg" loading>
  Submit
</Button>

// Card with header and footer
<Card
  variant="elevated"
  padding="lg"
  header={<h3>Title</h3>}
  footer={<Button>Action</Button>}
>
  Content
</Card>

// TextField with validation
<TextField
  label="Email"
  type="email"
  error={hasError}
  errorMessage="Invalid email"
  required
/>

// Modal with custom size
<Modal
  open={isOpen()}
  onClose={() => setIsOpen(false)}
  size="lg"
  title="Custom Modal"
>
  Modal content
</Modal>
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build all packages
npm run build

# Type check
npm run typecheck
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rakki194/reynard.git
cd reynard

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test
```

### Code Style

- **TypeScript** - Full TypeScript support with strict mode
- **ESLint** - Code linting with SolidJS-specific rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality assurance

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **SolidJS** - The reactive framework that powers Reynard
- **Chart.js** - Data visualization library for charts
- **zxcvbn** - Password strength analysis
- **Vitest** - Testing framework
- **Playwright** - End-to-end testing

## 📞 Support

- **Documentation** - [docs.reynard.dev](https://docs.reynard.dev)
- **Issues** - [GitHub Issues](https://github.com/rakki194/reynard/issues)
- **Discussions** - [GitHub Discussions](https://github.com/rakki194/reynard/discussions)
- **Discord** - [Join our Discord](https://discord.gg/reynard)

---

_Built with ❤️, 🐺 and 🤖!_
