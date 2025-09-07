/**
 * AddTodo Component
 * Form for adding new todos
 */

import { Component, createSignal } from "solid-js";
// Remove useCustomTranslation import - not available

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
      <button type="submit" class="add-button" disabled={!input().trim()}>
        Add Todo
      </button>
    </form>
  );
};
