/**
 * AddTodo Component
 * Form for adding new todos
 */

import { Component, createSignal } from "solid-js";
import { useCustomTranslation } from "../App";

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export const AddTodo: Component<AddTodoProps> = props => {
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
        onInput={e => setInput(e.currentTarget.value)}
      />
      <button type="submit" class="add-button" disabled={!input().trim()}>
        {t("todo.addButton")}
      </button>
    </form>
  );
};
