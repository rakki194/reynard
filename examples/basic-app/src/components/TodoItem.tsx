/**
 * TodoItem Component
 * Individual todo item with modern checkbox and smooth strikeout animation
 */

import { Button, Card, Checkbox } from "reynard-components-core";
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

export const TodoItem: Component<TodoItemProps> = props => {
  return (
    <Card
      variant={props.todo.completed ? "outlined" : "elevated"}
      padding="md"
      class={`todo-item ${props.todo.completed ? "completed" : ""}`}
      interactive
    >
      <div class="todo-item-content">
        <Checkbox
          size="md"
          checked={props.todo.completed}
          onChange={props.onToggle}
          variant="primary"
          aria-label={`Mark "${props.todo.text}" as ${props.todo.completed ? "incomplete" : "complete"}`}
        />

        <div class="todo-text-container">
          <span class="todo-text">{props.todo.text}</span>
          {props.todo.completed && <div class="todo-strikeout-line" />}
        </div>

        <Button variant="danger" size="sm" iconOnly onClick={() => props.onDelete()} title="Delete todo">
          ×
        </Button>
      </div>
    </Card>
  );
};
