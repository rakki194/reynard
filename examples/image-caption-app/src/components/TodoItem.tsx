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
          aria-label={`Mark "${props.todo.text}" as ${props.todo.completed ? "incomplete" : "complete"}`}
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
