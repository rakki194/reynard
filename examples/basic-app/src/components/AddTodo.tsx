/**
 * AddTodo Component
 * Form for adding new todos
 */

import { Button, TextField } from "reynard-components-core";
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
      <TextField
        type="text"
        placeholder={t("todo.placeholder")}
        value={input()}
        onInput={e => setInput(e.currentTarget.value)}
        fullWidth
        variant="outlined"
        size="md"
      />
      <Button type="submit" variant="primary" size="md" disabled={!input().trim()} fullWidth>
        {t("todo.addButton")}
      </Button>
    </form>
  );
};
