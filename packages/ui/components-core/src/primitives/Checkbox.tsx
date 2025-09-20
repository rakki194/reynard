/**
 * 🦊 Modern Checkbox Component
 * Accessible checkbox with smooth CSS animations and theme integration
 */

import { Component, splitProps } from "solid-js";
import "./Checkbox.css";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  class?: string;
  "aria-label"?: string;
  id?: string;
  indeterminate?: boolean;
}

export const Checkbox: Component<CheckboxProps> = props => {
  const [local, others] = splitProps(props, [
    "checked",
    "onChange",
    "disabled",
    "size",
    "variant",
    "class",
    "aria-label",
    "id",
    "indeterminate",
  ]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    local.onChange(target.checked);
  };

  const getClasses = () => {
    const classes = [
      "reynard-checkbox",
      `reynard-checkbox--${local.size || "md"}`,
      `reynard-checkbox--${local.variant || "default"}`,
    ];

    if (local.disabled) classes.push("reynard-checkbox--disabled");
    if (local.checked) classes.push("reynard-checkbox--checked");
    if (local.indeterminate) classes.push("reynard-checkbox--indeterminate");
    if (local.class) classes.push(local.class);

    return classes.join(" ");
  };

  return (
    <label class={getClasses()}>
      <input
        id={local.id}
        type="checkbox"
        checked={local.checked}
        onChange={handleChange}
        disabled={local.disabled}
        aria-label={local["aria-label"]}
        class="reynard-checkbox__input"
        {...others}
      />

      <span class="reynard-checkbox__box">
        {/* Checkmark */}
        {local.checked && !local.indeterminate && (
          <svg class="reynard-checkbox__checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
          </svg>
        )}

        {/* Indeterminate mark */}
        {local.indeterminate && <span class="reynard-checkbox__indeterminate" />}
      </span>
    </label>
  );
};
