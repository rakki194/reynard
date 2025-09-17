# State Patterns Documentation

## Overview

This document outlines the preferred patterns for handling component states in
YipYap's CSS architecture. We use data attributes and
ARIA attributes for state styling to maintain clean separation between logic and
presentation, improve accessibility, and reduce specificity conflicts.

## Core Principles

### 1. Prefer Data Attributes for States

Use `data-*` attributes for component states that don't have semantic meaning:

```tsx
// ✅ Good: Using data attributes for visual states
<div class={styles.card} data-active={isActive() ? '' : undefined}>
  Card content
</div>

// ❌ Avoid: Using class-based states
<div class={`${styles.card} ${isActive() ? styles.active : ''}`}>
  Card content
</div>
```

### 2. Use ARIA Attributes for Semantic States

Use ARIA attributes for states that have accessibility implications:

```tsx
// ✅ Good: Using ARIA for semantic states
<button aria-expanded={isExpanded()} aria-pressed={isPressed()} aria-selected={isSelected()}>
  Toggle
</button>
```

### 3. Combine with CSS Selectors

Style states using attribute selectors in CSS:

```css
/* State styling with data attributes */
.card[data-active] {
  border-color: var(--accent);
  box-shadow: var(--shadow-default);
}

/* State styling with ARIA attributes */
.button[aria-expanded="true"] {
  background: var(--accent);
  color: var(--text-on-accent);
}

.dropdown[aria-expanded="true"] .dropdown-content {
  display: block;
}
```

## Common State Patterns

### Interactive States

#### Active State

```tsx
// Component
<button data-active={isActive() ? '' : undefined}>
  Action
</button>

// CSS
.button[data-active] {
  background: var(--accent);
  color: var(--text-on-accent);
}
```

#### Selected State

```tsx
// Component
<div data-selected={isSelected() ? '' : undefined}>
  Item
</div>

// CSS
.item[data-selected] {
  background: color-mix(in srgb, var(--accent) 10%, var(--card-bg));
  border-color: var(--accent);
}
```

#### Hover State

```tsx
// Component - hover is handled by CSS :hover
<button class={styles.button}>
  Action
</button>

// CSS
.button:hover:not(:disabled) {
  background: var(--secondary-bg);
  transform: var(--hover-transform);
}
```

### Expansion States

#### Expandable Content

```tsx
// Component
<details>
  <summary aria-expanded={isExpanded()}>
    Toggle Content
  </summary>
  <div class={styles.content}>
    Content
  </div>
</details>

// CSS
.content {
  display: none;
}

details[open] .content {
  display: block;
}
```

#### Dropdown Menus

```tsx
// Component
<div class={styles.dropdown}>
  <button aria-expanded={isOpen()}>
    Menu
  </button>
  <div class={styles.menu}>
    Menu items
  </div>
</div>

// CSS
.menu {
  display: none;
}

.dropdown[aria-expanded="true"] .menu {
  display: block;
}
```

### Loading States

#### Loading Indicators

```tsx
// Component
<div data-loading={isLoading() ? '' : undefined}>
  <div class={styles.content}>Content</div>
  <div class={styles.spinner}>Loading...</div>
</div>

// CSS
.content {
  display: block;
}

.spinner {
  display: none;
}

[data-loading] .content {
  display: none;
}

[data-loading] .spinner {
  display: block;
}
```

### Error States

#### Form Validation

```tsx
// Component
<input
  data-error={hasError() ? '' : undefined}
  aria-invalid={hasError()}
  aria-describedby={hasError() ? 'error-message' : undefined}
/>

// CSS
.input[data-error] {
  border-color: var(--error);
  background: var(--error-bg);
}

.input[aria-invalid="true"] {
  border-color: var(--error);
}
```

## State Combinations

### Multiple States

```tsx
// Component
<button
  data-active={isActive() ? '' : undefined}
  data-loading={isLoading() ? '' : undefined}
  disabled={isLoading()}
>
  {isLoading() ? 'Loading...' : 'Submit'}
</button>

// CSS
.button[data-active] {
  background: var(--accent);
}

.button[data-loading] {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Handle state combinations */
.button[data-active][data-loading] {
  background: color-mix(in srgb, var(--accent) 70%, var(--text-secondary));
}
```

### Conditional States

```tsx
// Component
<div
  data-variant={variant()}
  data-size={size()}
  data-disabled={isDisabled() ? '' : undefined}
>
  Content
</div>

// CSS
.card[data-variant="primary"] {
  background: var(--accent);
}

.card[data-variant="secondary"] {
  background: var(--secondary-bg);
}

.card[data-size="small"] {
  padding: var(--half-spacing);
}

.card[data-size="large"] {
  padding: var(--double-spacing);
}

.card[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}
```

## Accessibility Considerations

### Screen Reader Support

```tsx
// Component
<button
  aria-pressed={isPressed()}
  aria-describedby="button-description"
>
  Toggle
</button>
<span id="button-description" class="sr-only">
  Toggle button for {description()}
</span>

// CSS
.button[aria-pressed="true"] {
  background: var(--accent);
}
```

### Focus Management

```tsx
// Component
<div
  data-focus-visible={isFocusVisible() ? '' : undefined}
  tabindex="0"
>
  Focusable content
</div>

// CSS
.focusable:focus-visible,
.focusable[data-focus-visible] {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

## Performance Considerations

### Efficient Selectors

```css
/* ✅ Good: Direct attribute selectors */
.button[data-active] {
  background: var(--accent);
}

/* ❌ Avoid: Complex descendant selectors */
.container .button[data-active] {
  background: var(--accent);
}
```

### Reduced Motion Support

```css
/* State transitions with reduced motion support */
.button {
  transition: background-color var(--transition-duration) var(--transition-timing);
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}
```

## Migration Guidelines

### From Class-Based States

```tsx
// Before
<div class={`${styles.card} ${isActive() ? styles.active : ''}`}>
  Content
</div>

// After
<div class={styles.card} data-active={isActive() ? '' : undefined}>
  Content
</div>
```

```css
/* Before */
.card.active {
  border-color: var(--accent);
}

/* After */
.card[data-active] {
  border-color: var(--accent);
}
```

### From Inline Styles

```tsx
// Before
<div style={{ backgroundColor: isActive() ? 'var(--accent)' : 'transparent' }}>
  Content
</div>

// After
<div data-active={isActive() ? '' : undefined}>
  Content
</div>
```

```css
/* CSS handles the styling */
.card[data-active] {
  background: var(--accent);
}
```

## Testing State Patterns

### Unit Tests

```tsx
// Test state attributes
test("applies active state", () => {
  render(<Button active={true} />);
  expect(screen.getByRole("button")).toHaveAttribute("data-active");
});

test("removes active state", () => {
  render(<Button active={false} />);
  expect(screen.getByRole("button")).not.toHaveAttribute("data-active");
});
```

### Visual Regression Tests

```tsx
// Test state combinations
test("renders loading and active states together", () => {
  render(<Button active={true} loading={true} />);
  const button = screen.getByRole("button");
  expect(button).toHaveAttribute("data-active");
  expect(button).toHaveAttribute("data-loading");
});
```

## Best Practices Summary

### Do's

- ✅ Use `data-*` attributes for visual states
- ✅ Use ARIA attributes for semantic states
- ✅ Keep state selectors simple and direct
- ✅ Provide reduced motion alternatives
- ✅ Test state combinations
- ✅ Document state dependencies

### Don'ts

- ❌ Don't use class-based state toggling
- ❌ Don't use inline styles for state styling
- ❌ Don't create deep descendant selectors for states
- ❌ Don't forget accessibility implications
- ❌ Don't animate expensive properties outside overlays
- ❌ Don't use `!important` to override state styles

## Examples in Codebase

### Gallery Components

- `ResponsiveGrid` uses `data-selected` for item selection
- `MultiSelectActions` uses `data-active` for button states
- `QuickJump` uses `aria-expanded` for dropdown states

### ImageViewer Components

- `ImageView` uses `data-zoomed` for zoom state
- `CaptionInput` uses `aria-expanded` for dropdown states
- `ModelSwitcher` uses `data-active` for model selection

### Settings Components

- `ConfigWatcher` uses `data-status` for configuration states
- `AdvancedConfigWatcher` uses `data-error` for validation states

This pattern ensures consistent, maintainable, and accessible state management across the application.
