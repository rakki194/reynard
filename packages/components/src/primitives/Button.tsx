/**
 * Button Component
 * A versatile button component with multiple variants and states
 */

import { Component, JSX, splitProps, mergeProps } from "solid-js";

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?:
    | "primary"
    | "secondary" 
    | "tertiary"
    | "ghost"
    | "danger"
    | "success"
    | "warning";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Icon only button */
  iconOnly?: boolean;
  /** Left icon */
  leftIcon?: JSX.Element;
  /** Right icon */
  rightIcon?: JSX.Element;
  /** Children content */
  children?: JSX.Element;
}

const defaultProps: Partial<ButtonProps> = {
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
  fullWidth: false,
  iconOnly: false,
};

export const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    "variant",
    "size",
    "loading",
    "disabled",
    "fullWidth", 
    "iconOnly",
    "leftIcon",
    "rightIcon",
    "children",
    "class",
  ]);

  const getButtonClasses = () => {
    const classes = ["reynard-button"];
    
    // Add variant class
    classes.push(`reynard-button--${local.variant}`);
    
    // Add size class
    classes.push(`reynard-button--${local.size}`);
    
    // Add state classes
    if (local.disabled || local.loading) {
      classes.push("reynard-button--disabled");
    }
    
    if (local.loading) {
      classes.push("reynard-button--loading");
    }
    
    if (local.fullWidth) {
      classes.push("reynard-button--full-width");
    }
    
    if (local.iconOnly) {
      classes.push("reynard-button--icon-only");
    }
    
    // Add custom class
    if (local.class) {
      classes.push(local.class);
    }
    
    return classes.join(" ");
  };

  return (
    <button
      class={getButtonClasses()}
      disabled={local.disabled || local.loading}
      {...others}
    >
      {local.leftIcon && (
        <span class="reynard-button__icon reynard-button__icon--left">
          {local.leftIcon}
        </span>
      )}
      
      {local.loading && (
        <span class="reynard-button__spinner" />
      )}
      
      {!local.iconOnly && local.children && (
        <span class="reynard-button__content">
          {local.children}
        </span>
      )}
      
      {local.iconOnly && local.children}
      
      {local.rightIcon && (
        <span class="reynard-button__icon reynard-button__icon--right">
          {local.rightIcon}
        </span>
      )}
    </button>
  );
};