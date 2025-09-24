/**
 * Basic Todo App - Reynard Framework Example
 * Demonstrates core Reynard features in a simple, practical application
 */

import { Card } from "reynard-components-core";
import "reynard-components-core/styles";
import { NotificationsProvider, createNotificationsModule, useNotifications } from "reynard-core";
import { ReynardProvider, useI18n, useTheme, type LanguageCode } from "reynard-themes";
import "reynard-themes/themes.css";
import { Component, For, createContext, createResource, createSignal, useContext } from "solid-js";
import { AddTodo } from "./components/AddTodo";
import { LanguageSelector } from "./components/LanguageSelector";
import { ThemeToggle } from "./components/ThemeToggle";
import { TodoItem } from "./components/TodoItem";
import "./styles.css";
import { loadTranslations } from "./translations";

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
    throw new Error("useCustomTranslation must be used within a CustomTranslationProvider");
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
    console.log("Custom setLocale called with:", newLocale);
    setLocale(newLocale);
    setCurrentLocale(newLocale);
  };

  // Load custom translations for this app
  const [translationsResource] = createResource(() => {
    console.log("Translation resource triggered with locale:", currentLocale());
    return currentLocale();
  }, loadTranslations);

  // Create a custom translation function that uses our app's translations
  const customT = (key: string, params?: Record<string, string>) => {
    const translations = translationsResource();
    console.log("customT called with key:", key, "translations:", translations, "locale:", currentLocale());

    if (!translations) {
      console.log("No translations loaded, returning key:", key);
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

    console.log("Translation not found for key:", key, "value:", value);
    return key;
  };

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: nextId(),
      text,
      completed: false,
    };
    setTodos(prev => [...prev, newTodo]);
    setNextId(prev => prev + 1);
    notify(customT("todo.added", { text }), "success");
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: number) => {
    const todo = todos().find(t => t.id === id);
    setTodos(prev => prev.filter(todo => todo.id !== id));
    if (todo) {
      notify(customT("todo.deleted", { text: todo.text }), "info");
    }
  };

  const completedCount = () => todos().filter(todo => todo.completed).length;
  const totalCount = () => todos().length;

  return (
    <div class="app">
      <header class="app-header">
        <Card variant="elevated" padding="lg" class="header-card">
          <h1>
            <span class="reynard-logo">🦊</span>
            {customT("app.title")}
          </h1>
          <p>{customT("app.subtitle")}</p>
          <div class="header-controls">
            <div class="theme-info">{customT("theme.current", { theme: customT(`theme.${theme}`) })}</div>
            <CustomTranslationContext.Provider value={customT}>
              <ThemeToggle />
            </CustomTranslationContext.Provider>
            <LanguageSelector setLocale={customSetLocale} />
          </div>
        </Card>
      </header>

      <main class="app-main">
        <div class="todo-container">
          <Card variant="default" padding="md" class="stats-card">
            <div class="todo-stats">
              <span class="stat">
                {completedCount()} / {totalCount()} {customT("todo.completed")}
              </span>
            </div>
          </Card>

          <Card variant="elevated" padding="lg" class="add-todo-card">
            <CustomTranslationContext.Provider value={customT}>
              <AddTodo onAdd={addTodo} />
            </CustomTranslationContext.Provider>
          </Card>

          <Card variant="default" padding="md" class="todo-list-card">
            <div class="todo-list">
              <For each={todos()}>
                {todo => (
                  <TodoItem todo={todo} onToggle={() => toggleTodo(todo.id)} onDelete={() => deleteTodo(todo.id)} />
                )}
              </For>
              {todos().length === 0 && (
                <div class="empty-state">
                  <p>{customT("todo.empty")}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      <footer class="app-footer">
        <Card variant="outlined" padding="sm" class="footer-card">
          <p>{customT("footer.text")}</p>
        </Card>
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
