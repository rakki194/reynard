# CSS Modules Guide for YipYap

This guide covers how to write CSS for YipYap using CSS Modules, following the
established patterns and best practices used throughout the codebase.

## Overview

CSS Modules provide local scoping for CSS class names, preventing global
conflicts and enabling component-based styling. In YipYap, we use CSS Modules
for all component-specific styles, with global styles reserved for resets,
layout primitives, and design tokens.

## File Naming Convention

Use the `.module.css` extension for all CSS Module files:

```plaintext
ComponentName.module.css
```

## Basic Usage

### Creating a CSS Module

```css
/* Button.module.css */
.button {
  padding: var(--half-spacing) var(--spacing);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-duration) var(--transition-timing);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--half-spacing);
  border: 1px solid transparent;
  background: none;
}

.button:hover:not(:disabled) {
  background: var(--secondary-bg);
  color: var(--text-primary);
}
```

### Using in Components

```tsx
// Button.tsx
import { Component, JSX, createMemo } from "solid-js";
import styles from "./Button.module.css";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "error";
  size?: "small" | "medium" | "large";
}

export const Button: Component<ButtonProps> = (props) => {
  const {
    variant = "primary",
    size = "medium",
    class: className,
    children,
    ...restProps
  } = props;

  const buttonClasses = createMemo(() => {
    return [styles.button, styles[variant], styles[size], className || ""]
      .filter(Boolean)
      .join(" ");
  });

  return (
    <button class={buttonClasses()} {...restProps}>
      {children}
    </button>
  );
};
```

## Design Tokens and Variables

Always use CSS custom properties from the theme system instead of hard-coded
values:

### Available Tokens

#### Colors

```css
--accent: hsl(270deg 60% 60%);
--bg-color: hsl(220deg 20% 95%);
--secondary-bg: hsl(220deg 15% 90%);
--card-bg: hsl(220deg 15% 85%);
--text-primary: hsl(240deg 15% 12%);
--text-secondary: hsl(240deg 10% 45%);
--text-tertiary: hsl(220deg 20% 95%);
--text-on-accent: hsl(220deg 20% 95%);
--border-color: var(--card-bg);
--border-secondary: var(--accent);
```

#### Spacing

```css
--spacing: 0.7rem;
--quarter-spacing: calc(var(--spacing) / 4);
--half-spacing: calc(var(--spacing) / 2);
--double-spacing: calc(var(--spacing) * 2);
--triple-spacing: calc(var(--spacing) * 3);
--quad-spacing: calc(var(--spacing) * 4);
```

#### Motion

```css
--duration-fast: 120ms;
--duration-base: 200ms;
--duration-slow: 320ms;
--easing-standard: cubic-bezier(0.2, 0, 0, 1);
--easing-decelerate: cubic-bezier(0, 0, 0, 1);
--easing-accelerate: cubic-bezier(0.3, 0, 1, 1);
--transition-duration: 0.2s;
--transition-timing: ease;
```

#### Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-tooltip: 30;
--z-modal: 40;
--z-toast: 50;
```

#### Elevation (Shadows)

```css
--elevation-1: 0 1px 2px rgb(var(--shadow-rgb, 0 0 0) / 12%);
--elevation-2: 0 2px 4px rgb(var(--shadow-rgb, 0 0 0) / 16%);
--elevation-3: 0 4px 8px rgb(var(--shadow-rgb, 0 0 0) / 20%);
--elevation-4: 0 8px 16px rgb(var(--shadow-rgb, 0 0 0) / 24%);
```

## State Management Patterns

### Using Data Attributes for States

Prefer data attributes over class-based states for better separation of
concerns:

```tsx
// Component
<div class={styles.card} data-active={isActive() ? '' : undefined}>
  Card content
</div>

// CSS
.card[data-active] {
  border-color: var(--accent);
  box-shadow: var(--elevation-2);
}
```

### Using ARIA Attributes for Semantic States

Use ARIA attributes for states with accessibility implications:

```tsx
// Component
<button
  aria-expanded={isExpanded()}
  aria-pressed={isPressed()}
>
  Toggle
</button>

// CSS
.button[aria-expanded="true"] {
  background: var(--accent);
  color: var(--text-on-accent);
}
```

### Class-Based Variants

For component variants, use class-based approach:

```css
/* Button.module.css */
.button {
  /* Base styles */
}

.button.primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.button.secondary {
  background: var(--bg-color);
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.button.small {
  padding: var(--quarter-spacing) var(--half-spacing);
  font-size: 0.8rem;
}

.button.large {
  padding: var(--spacing) var(--double-spacing);
  font-size: 1rem;
}
```

## Composition

### Composing Classes Within a Module

Use `composes` to combine styles within the same module:

```css
.baseButton {
  padding: var(--half-spacing) var(--spacing);
  border-radius: var(--border-radius);
  cursor: pointer;
}

.primaryButton {
  composes: baseButton;
  background: var(--accent);
  color: var(--text-on-accent);
}

.secondaryButton {
  composes: baseButton;
  background: var(--bg-color);
  color: var(--text-secondary);
}
```

### Composing from Other Modules

Compose styles from other CSS modules:

```css
/* Card.module.css */
.card {
  composes: baseCard from "./primitives/Card.module.css";
  /* Additional card-specific styles */
}
```

### Composing from Global Classes

Compose from global class names:

```css
.globalButton {
  composes: global-button from global;
  /* Additional local styles */
}
```

## Cascade Layers

All component styles should be placed under the `components` layer:

```css
/* Component.module.css */
@layer components {
  .component {
    /* Component styles */
  }

  .component:hover {
    /* Hover styles */
  }
}
```

## Specificity Management

### Using `:where()` for Lower Specificity

Use `:where()` to reduce specificity when possible:

```css
/* Low specificity selectors */
.component:where(:not(.noop)) {
  /* Styles with zero specificity */
}

.component:where(:hover) {
  /* Hover styles with zero specificity */
}
```

### Avoiding Deep Descendant Selectors

Prefer class-based states over deep descendant selectors:

```css
/* ✅ Good: Class-based state */
.card[data-active] .content {
  color: var(--accent);
}

/* ❌ Avoid: Deep descendants */
.card .content .item .text {
  color: var(--accent);
}
```

## Pseudo Classes and States

CSS Modules support all pseudo classes and states:

```css
.button {
  /* Base styles */
}

.button:hover {
  background: var(--secondary-bg);
}

.button:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.button:active {
  transform: translateY(1px);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Responsive Design

Use container queries and media queries as needed:

```css
.component {
  /* Base styles */
}

/* Container queries */
@container (min-width: 400px) {
  .component {
    /* Styles for wider containers */
  }
}

/* Media queries */
@media (max-width: 768px) {
  .component {
    /* Mobile styles */
  }
}
```

## Accessibility

### Focus Management

Ensure proper focus indicators:

```css
.component:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

### Reduced Motion Support

Respect user motion preferences:

```css
.component {
  transition: transform var(--duration-base) var(--easing-standard);
}

@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
  }
}
```

## Performance Considerations

### Hardware Acceleration

Use hardware-accelerated properties for animations:

```css
.component {
  transform: translate3d(0, 0, 0); /* Force hardware acceleration */
  will-change: transform; /* Hint for animations */
}
```

### Efficient Selectors

Use efficient selectors and avoid expensive operations:

```css
/* ✅ Efficient */
.component {
  background: var(--bg-color);
}

/* ❌ Expensive */
.component {
  background: linear-gradient(45deg, var(--bg-color), var(--secondary-bg));
}
```

## Testing CSS Modules

### Mocking CSS Modules in Tests

```tsx
// Component.test.tsx
import { vi } from "vitest";

vi.mock("./Component.module.css", () => ({
  component: "component-class",
  active: "active-class",
  disabled: "disabled-class",
}));

// Test component with mocked styles
```

## Common Patterns

### Conditional Classes

```tsx
const classes = createMemo(() => {
  return [
    styles.base,
    props.variant && styles[props.variant],
    props.size && styles[props.size],
    props.disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");
});
```

### Multiple Style Imports

```tsx
import baseStyles from "./Base.module.css";
import variantStyles from "./Variants.module.css";

const styles = { ...baseStyles, ...variantStyles };
```

### Theme-Aware Components

```css
/* Component.module.css */
.component {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* Theme-specific overrides */
:root[data-theme="dark"] .component {
  background: var(--card-bg);
  border-color: var(--border-secondary);
}
```

## Best Practices

1. **Use Design Tokens**: Always use CSS custom properties from the theme system
2. **Prefer Data Attributes**: Use `data-*` attributes for component states
3. **Keep Specificity Low**: Use `:where()` and avoid deep selectors
4. **Follow Naming Conventions**: Use camelCase for class names
5. **Compose Styles**: Use `composes` for reusable style combinations
6. **Layer Organization**: Place all styles under the `components` layer
7. **Accessibility First**: Ensure proper focus management and reduced motion
   support
8. **Performance Conscious**: Use hardware acceleration and efficient selectors
9. **Test Your Styles**: Mock CSS modules in component tests
10. **Theme Integration**: Make components work across all themes

## File Structure

```plaintext
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.module.css
│   │   └── ComponentName.test.tsx
│   └── UI/
│       └── primitives/
│           ├── Button.tsx
│           ├── Button.module.css
│           └── Button.test.tsx
├── styles.css          # Global styles and layers
└── themes.css          # Theme variables and tokens
```

This guide provides a comprehensive overview of CSS Modules usage in YipYap,
following the established patterns and best practices used throughout the
codebase.
