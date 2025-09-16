/**
 * Card Component
 * A flexible container component with consistent styling
 */

import { Component, JSX, splitProps, mergeProps } from "solid-js";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: "default" | "elevated" | "outlined" | "filled";
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Whether the card is interactive */
  interactive?: boolean;
  /** Whether the card is selected */
  selected?: boolean;
  /** Header content */
  header?: JSX.Element;
  /** Footer content */
  footer?: JSX.Element;
  /** Children content */
  children?: JSX.Element;
}

const defaultProps: Partial<CardProps> = {
  variant: "default",
  padding: "md",
  interactive: false,
  selected: false,
};

export const Card: Component<CardProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    "variant",
    "padding",
    "interactive",
    "selected",
    "header",
    "footer",
    "children",
    "class",
  ]);

  const getClasses = () => {
    const classes = [
      "reynard-card",
      `reynard-card--${local.variant}`,
      `reynard-card--padding-${local.padding}`,
    ];

    if (local.interactive) classes.push("reynard-card--interactive");
    if (local.selected) classes.push("reynard-card--selected");
    if (local.class) classes.push(local.class);

    return classes.join(" ");
  };

  return (
    <div class={getClasses()} {...others}>
      {local.header && <div class="reynard-card__header">{local.header}</div>}

      {local.children && (
        <div class="reynard-card__content">{local.children}</div>
      )}

      {local.footer && <div class="reynard-card__footer">{local.footer}</div>}
    </div>
  );
};
