/**
 * Basic Todo App - Reynard Framework Example
 * Demonstrates core Reynard features in a simple, practical application
 */

import {
  Component,
  createSignal,
  For,
  createEffect,
  createResource,
} from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  I18nProvider,
  useTheme,
  useNotifications,
  useI18n,
  createThemeModule,
  createNotificationsModule,
  createI18nModule,
} from "@reynard/core";
import { fluentIconsPackage } from "@reynard/fluent-icons";
import { TodoItem } from "./components/TodoItem";
import { AddTodo } from "./components/AddTodo";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageSelector } from "./components/LanguageSelector";
import { loadTranslations } from "./translations";
import "./styles.css";

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
  const { t, locale, setTranslations } = useI18n();

  // Load translations reactively when locale changes
  const [translationsResource] = createResource(locale, loadTranslations);

  // Update translations when resource loads
  createEffect(() => {
    const translations = translationsResource();
    if (translations) {
      setTranslations(translations);
    }
  });

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: nextId(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setNextId((prev) => prev + 1);
    notify(t("todo.added", { text }), "success");
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
      notify(t("todo.deleted", { text: todo.text }), "info");
    }
  };

  const completedCount = () => todos().filter((todo) => todo.completed).length;
  const totalCount = () => todos().length;

  return (
    <div class="app">
      <header class="app-header">
        <h1>
          <span class="reynard-logo">
            {fluentIconsPackage.getIcon("yipyap") && (
              <div
                innerHTML={fluentIconsPackage.getIcon("yipyap")?.outerHTML}
              />
            )}
          </span>
          {t("app.title")}
        </h1>
        <p>{t("app.subtitle")}</p>
        <div class="header-controls">
          <div class="theme-info">
            {t("theme.current", { theme: t(`theme.${theme()}`) })}
          </div>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      <main class="app-main">
        <div class="todo-container">
          <div class="todo-stats">
            <span class="stat">
              {completedCount()} / {totalCount()} {t("todo.completed")}
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
                <p>{t("todo.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>{t("footer.text")}</p>
      </footer>
    </div>
  );
};

const App: Component = () => {
  const themeModule = createThemeModule();
  const notificationsModule = createNotificationsModule();
  const i18nModule = createI18nModule();

  return (
    <ThemeProvider value={themeModule}>
      <I18nProvider value={i18nModule}>
        <NotificationsProvider value={notificationsModule}>
          <TodoApp />
        </NotificationsProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
