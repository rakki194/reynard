# 📚 Complete Tutorial: Building Your First Reynard App

This comprehensive tutorial will guide you through creating a complete application with Reynard, from setup to deployment.

## Step 1: Project Setup

### Option A: Using the Test App Template

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

### Option B: Create a New Project

```bash
# Create a new directory
mkdir my-reynard-app
cd my-reynard-app

# Initialize package.json
npm init -y

# Install dependencies
npm install reynard-core reynard-components reynard-chat reynard-rag solid-js
npm install -D vite vite-plugin-solid typescript @types/node
```

## Step 2: Basic Project Structure

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

## Step 4: Theme Setup

### `src/themes.css`

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

## Step 5: Application Entry Point

### `src/main.tsx`

```tsx
import { render } from "solid-js/web";
import "./themes.css";
import App from "./App";

render(() => <App />, document.getElementById("root")!);
```

## Step 6: Main Application Component

### `src/App.tsx`

```tsx
import { ReynardProvider } from "reynard-themes";
import "reynard-themes/themes.css";
import { ThemeDemo } from "./components/ThemeDemo";

function App() {
  return (
    <ReynardProvider>
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
    </ReynardProvider>
  );
}

export default App;
```

## Step 7: Creating Your First Component

### `src/components/ThemeDemo.tsx`

```tsx
import { Button, Card } from "reynard-components";
import { useTheme } from "reynard-themes";

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

## Step 8: Building a Complete Todo App

Let's build a more comprehensive example - a todo application that demonstrates multiple Reynard features.

### Enhanced `src/App.tsx` for Todo App

```tsx
import { Component, createSignal, For, createEffect } from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  createTheme,
  createNotifications,
  useTheme,
  useNotifications,
} from "reynard-core";
import { Button, Card } from "reynard-components";
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

### `src/components/TodoItem.tsx`

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

### `src/components/AddTodo.tsx`

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

### `src/components/ThemeToggle.tsx`

```tsx
import { Component } from "solid-js";
import { Button } from "reynard-components";
import { useTheme } from "reynard-themes";

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

## Step 9: Adding Styles

### Enhanced `src/themes.css` with Todo App Styles

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

## Step 10: Running Your Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Step 11: Advanced Features

### Adding Internationalization

```tsx
import { I18nProvider, createI18nModule, useI18n } from "reynard-core";

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

### Adding Local Storage Persistence

```tsx
import { useLocalStorage } from "reynard-core";

const TodoApp: Component = () => {
  const [todos, setTodos] = useLocalStorage("todos", [
    { id: 1, text: "Learn SolidJS", completed: true },
    { id: 2, text: "Try Reynard framework", completed: false },
  ]);

  // Todos will automatically persist to localStorage
  // and restore on page reload
};
```

## Step 12: Deployment

### Build for Production

```bash
npm run build
```

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

## 🎯 What You've Learned

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

## 🚀 Next Steps

Now that you have a solid foundation, try:

- **Adding Chat Features** - Use `reynard-chat` for messaging and real-time communication
- **Implementing RAG Search** - Add intelligent search with `reynard-rag`
- **Adding Authentication** - Use `reynard-auth` for user management
- **Data Visualization** - Add charts with `reynard-charts`
- **File Management** - Implement file uploads with `reynard-gallery`
- **Caption Generation** - Add AI-powered caption generation with `reynard-annotating` and `reynard-caption`
- **Advanced Settings** - Add configuration with `reynard-settings`
- **Real-time Features** - WebSocket integration for live updates
- **Progressive Web App** - Add PWA capabilities
- **Testing** - Write unit and integration tests
- **Performance** - Optimize bundle size and loading

---

*Ready to build something amazing? Check out the [Package Documentation](./packages.md) to explore all available features!* 🦊
