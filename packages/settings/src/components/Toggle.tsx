/**
 * Button Component
 * A simple toggle switch component
 */

import { Component, JSX, splitProps } from "solid-js";
import { Toggle } from "reynard-components";

export interface ToggleProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Button state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const Toggle: Component<ToggleProps> = (props) => {
  const [local, others] = splitProps(props, [
    "checked",
    "onChange",
    "label",
    "helperText",
    "disabled",
  ]);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    local.onChange(target.checked);
  };

  return (
    <div class="toggle-container">
      {local.label && <label class="toggle-label">{local.label}</label>}
      <div class="toggle-wrapper">
        <input
          type="checkbox"
          checked={local.checked}
          onChange={handleChange}
          disabled={local.disabled}
          class="toggle-input"
          {...others}
        />
        <span class="toggle-slider"></span>
      </div>
      {local.helperText && (
        <div class="toggle-helper-text">{local.helperText}</div>
      )}
    </div>
  );
};
