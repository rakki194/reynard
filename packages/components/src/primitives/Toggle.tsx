/**
 * 🦊 Toggle Component
 * Accessible toggle switch with size variants and theme support
 */

import { Component, splitProps } from "solid-js";
import "./Toggle.css";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  class?: string;
  "aria-label"?: string;
  id?: string;
}

export const Toggle: Component<ToggleProps> = props => {
  const [local, others] = splitProps(props, ["checked", "onChange", "disabled", "size", "class", "aria-label", "id"]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    local.onChange(target.checked);
  };

  return (
    <label class={`toggle ${local.size || "md"} ${local.class || ""} ${local.disabled ? "disabled" : ""}`}>
      <input
        id={local.id}
        type="checkbox"
        checked={local.checked}
        onChange={handleChange}
        disabled={local.disabled}
        aria-label={local["aria-label"]}
        class="toggle__input"
        {...others}
      />
      <span class="toggle__slider" />
    </label>
  );
};
