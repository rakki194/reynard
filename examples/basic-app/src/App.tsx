/**
 * Basic Todo App - Reynard Framework Example
 * Demonstrates core Reynard features in a simple, practical application
 */

import { Component, createSignal, For } from 'solid-js';
import { ThemeProvider, NotificationsProvider, createTheme, createNotifications, useTheme, useNotifications } from '@reynard/core';
import { TodoItem } from './components/TodoItem';
import { AddTodo } from './components/AddTodo';
import { ThemeToggle } from './components/ThemeToggle';
import './styles.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: Component = () => {
  const [todos, setTodos] = createSignal<Todo[]>([
    { id: 1, text: 'Learn SolidJS', completed: true },
    { id: 2, text: 'Try Reynard framework', completed: false },
    { id: 3, text: 'Build something awesome', completed: false },
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
    setTodos(prev => [...prev, newTodo]);
    setNextId(prev => prev + 1);
    notify(`Added: "${text}"`, 'success');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    const todo = todos().find(t => t.id === id);
    setTodos(prev => prev.filter(todo => todo.id !== id));
    if (todo) {
      notify(`Deleted: "${todo.text}"`, 'info');
    }
  };

  const completedCount = () => todos().filter(todo => todo.completed).length;
  const totalCount = () => todos().length;

  return (
    <div class="app">
      <header class="app-header">
        <h1>🦊 Todo App</h1>
        <p>A simple todo app built with Reynard framework</p>
        <div class="header-controls">
          <div class="theme-info">
            Current theme: <strong>{theme}</strong>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main class="app-main">
        <div class="todo-container">
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
                <p>No todos yet. Add one above! ✨</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>Built with Reynard framework • SolidJS • Love</p>
      </footer>
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
