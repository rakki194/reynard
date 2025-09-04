/**
 * Select Component
 * A flexible select dropdown component with styling and validation
 */

import {
  Component,
  JSX,
  splitProps,
  mergeProps,
  createSignal,
  For,
} from "solid-js";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Select variant */
  variant?: "default" | "filled" | "outlined";
  /** Select size */
  size?: "sm" | "md" | "lg";
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Label text */
  label?: string;
  /** Whether label is required */
  required?: boolean;
  /** Left icon */
  leftIcon?: JSX.Element;
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Options array */
  options?: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
}

const defaultProps: Partial<SelectProps> = {
  variant: "default",
  size: "md",
  error: false,
  required: false,
  fullWidth: false,
  loading: false,
  options: [],
};

export const Select: Component<SelectProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    "variant",
    "size",
    "error",
    "errorMessage",
    "helperText",
    "label",
    "required",
    "leftIcon",
    "fullWidth",
    "loading",
    "options",
    "placeholder",
    "children",
    "class",
    "id",
  ]);

  const [selectId] = createSignal(
    local.id || `select-${Math.random().toString(36).substr(2, 9)}`,
  );
  const [focused, setFocused] = createSignal(false);

  const getWrapperClasses = () => {
    const classes = [
      "reynard-select",
      `reynard-select--${local.variant}`,
      `reynard-select--${local.size}`,
    ];

    if (local.error) classes.push("reynard-select--error");
    if (focused()) classes.push("reynard-select--focused");
    if (local.fullWidth) classes.push("reynard-select--full-width");
    if (local.loading) classes.push("reynard-select--loading");
    if (local.class) classes.push(local.class);

    return classes.join(" ");
  };

  const getSelectClasses = () => {
    const classes = ["reynard-select__input"];
    if (local.leftIcon) classes.push("reynard-select__input--with-left-icon");
    return classes.join(" ");
  };

  return (
    <div class={getWrapperClasses()}>
      {local.label && (
        <label class="reynard-select__label" for={selectId()}>
          {local.label}
          {local.required && <span class="reynard-select__required">*</span>}
        </label>
      )}

      <div class="reynard-select__input-wrapper">
        {local.leftIcon && (
          <div class="reynard-select__icon reynard-select__icon--left">
            {local.leftIcon}
          </div>
        )}

        <select
          id={selectId()}
          class={getSelectClasses()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...others}
        >
          {local.placeholder && (
            <option value="" disabled selected hidden>
              {local.placeholder}
            </option>
          )}

          {local.options && local.options.length > 0 ? (
            <For each={local.options}>
              {(option) => (
                <option value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              )}
            </For>
          ) : (
            local.children
          )}
        </select>

        <div class="reynard-select__chevron">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z" />
          </svg>
        </div>

        {local.loading && <div class="reynard-select__spinner" />}
      </div>

      {(local.errorMessage || local.helperText) && (
        <div class="reynard-select__help">
          {local.error && local.errorMessage ? (
            <span class="reynard-select__error-message">
              {local.errorMessage}
            </span>
          ) : (
            local.helperText && (
              <span class="reynard-select__helper-text">
                {local.helperText}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
};
