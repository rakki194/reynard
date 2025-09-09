# Responsive and Modern CSS Patterns

## Overview

This document outlines modern CSS patterns for responsive design, performance optimization, and accessibility in YipYap. We focus on container queries, reduced motion support, and avoiding expensive animations outside of overlays.

## Container Queries

### Introduction

Container queries allow components to adapt their layout based on their container's size rather than the viewport size. This provides more granular control and better component reusability.

### Basic Container Query Setup

```css
/* Define a container */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Query the container */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--spacing);
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--half-spacing);
  }
}
```

### Container Query Utilities

We provide utility classes for common container patterns:

```css
/* Container setup utilities */
.container {
  container-type: inline-size;
}

.container-name-layout {
  container-name: layout;
}

.container-name-card {
  container-name: card;
}

.container-name-sidebar {
  container-name: sidebar;
}
```

### Component Examples

#### Responsive Card Layout

```tsx
// Component
<div class={`${styles.cardContainer} container container-name-card`}>
  <div class={styles.card}>
    <img src={image} alt="Card image" />
    <div class={styles.content}>
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

```css
/* Card.module.css */
.cardContainer {
  width: 100%;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--half-spacing);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

/* Container query for wider cards */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--spacing);
  }

  .card img {
    height: 100%;
    min-height: 150px;
  }
}

/* Container query for very wide cards */
@container card (min-width: 600px) {
  .card {
    grid-template-columns: 250px 1fr;
    gap: var(--double-spacing);
  }
}
```

#### Responsive Gallery Grid

```tsx
// Component
<div class={`${styles.galleryContainer} container container-name-layout`}>
  <div class={styles.gallery}>
    {items.map((item) => (
      <div class={styles.item} key={item.id}>
        {item.content}
      </div>
    ))}
  </div>
</div>
```

```css
/* Gallery.module.css */
.galleryContainer {
  width: 100%;
}

.gallery {
  display: grid;
  gap: var(--spacing);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* Adjust grid for different container sizes */
@container layout (min-width: 800px) {
  .gallery {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--double-spacing);
  }
}

@container layout (min-width: 1200px) {
  .gallery {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
```

## Reduced Motion Support

### Core Principles

1. **Respect user preferences**: Always check `prefers-reduced-motion`
2. **Avoid expensive animations**: Don't animate layout/paint properties outside overlays
3. **Provide alternatives**: Offer reduced or no-motion alternatives

### Implementation Patterns

#### Basic Reduced Motion Support

```css
/* Default animation */
.button {
  transition: transform var(--transition-duration) var(--transition-timing);
}

.button:hover {
  transform: translateY(-2px);
}

/* Reduced motion alternative */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .button:hover {
    transform: none;
  }
}
```

#### Utility Classes for Reduced Motion

```css
/* Transition utilities with reduced motion support */
.transition {
  transition: all var(--transition-duration) var(--transition-timing);
}

.transition-colors {
  transition:
    color var(--transition-duration) var(--transition-timing),
    background-color var(--transition-duration) var(--transition-timing),
    border-color var(--transition-duration) var(--transition-timing);
}

.transition-transform {
  transition: transform var(--transition-duration) var(--transition-timing);
}

.transition-opacity {
  transition: opacity var(--transition-duration) var(--transition-timing);
}

/* Reduced motion overrides */
@media (prefers-reduced-motion: reduce) {
  .transition,
  .transition-colors,
  .transition-transform,
  .transition-opacity {
    transition: none;
  }

  .animate-spin {
    animation: none;
  }
}
```

#### Component-Level Reduced Motion

```css
/* Card hover effects */
.card {
  transition: box-shadow var(--transition-duration) var(--transition-timing);
}

.card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }

  .card:hover {
    transform: none;
    /* Keep shadow change for visual feedback */
    box-shadow: var(--shadow-hover);
  }
}
```

## Performance Considerations

### Expensive Properties

Avoid animating these properties outside of overlays:

- `width`, `height`
- `padding`, `margin`
- `top`, `left`, `right`, `bottom`
- `font-size`
- `line-height`

### Safe Animation Properties

These properties are safe to animate:

- `transform` (translate, scale, rotate)
- `opacity`
- `color`, `background-color`
- `border-color`
- `box-shadow` (with caution)

### Will-Change Optimization

#### When to Use `will-change`

```css
/* ✅ Good: Performance-critical animations */
.image-viewer {
  will-change: transform;
}

.modal-overlay {
  will-change: opacity;
}

/* ❌ Avoid: Non-critical animations */
.button:hover {
  will-change: transform; /* Unnecessary */
}
```

#### Will-Change Audit

We audit `will-change` usage to ensure it's only used where necessary:

```css
/* ImageViewer - Performance critical */
.image-viewer {
  will-change: transform; /* ✅ Justified for smooth pan/zoom */
}

/* Notification - Performance critical */
.notification {
  will-change: transform, opacity; /* ✅ Justified for smooth entrance */
}

/* Button hover - Not performance critical */
.button:hover {
  /* ❌ Remove will-change if present */
  transform: translateY(-1px);
}
```

### Layout Hacks Avoidance

#### Before: Layout Hacks

```css
/* ❌ Avoid: Layout hacks */
.gallery {
  display: flex;
  flex-wrap: wrap;
}

.gallery-item {
  width: calc(33.333% - 20px); /* Brittle hack */
  margin: 10px;
}
```

#### After: Modern CSS

```css
/* ✅ Good: Modern CSS Grid */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing);
}
```

## Responsive Design Patterns

### Mobile-First Approach

```css
/* Base styles (mobile) */
.card {
  padding: var(--spacing);
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: var(--double-spacing);
    font-size: 16px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card {
    padding: var(--triple-spacing);
    font-size: 18px;
  }
}
```

### Container Query Alternative

```css
/* Container-based responsive design */
.card-container {
  container-type: inline-size;
}

.card {
  padding: var(--spacing);
  font-size: 14px;
}

@container (min-width: 400px) {
  .card {
    padding: var(--double-spacing);
    font-size: 16px;
  }
}

@container (min-width: 600px) {
  .card {
    padding: var(--triple-spacing);
    font-size: 18px;
  }
}
```

### Responsive Utilities

```css
/* Responsive utility classes */
@media (max-width: 768px) {
  .sm\:flex-col {
    flex-direction: column;
  }

  .sm\:p-0 {
    padding: 0;
  }

  .sm\:gap-sm {
    gap: var(--half-spacing);
  }
}

@media (max-width: 480px) {
  .xs\:flex-col {
    flex-direction: column;
  }

  .xs\:p-xs {
    padding: var(--quarter-spacing);
  }

  .xs\:gap-xs {
    gap: var(--quarter-spacing);
  }
}
```

## Accessibility Considerations

### Focus Management

```css
/* Ensure focus indicators work with reduced motion */
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Don't rely on animations for focus indication */
@media (prefers-reduced-motion: reduce) {
  .button:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
}
```

### Screen Reader Support

```css
/* Ensure content is accessible regardless of animations */
.content {
  /* Content remains accessible */
}

.content[aria-hidden="true"] {
  display: none;
}

/* Don't hide content with opacity/transform for screen readers */
@media (prefers-reduced-motion: reduce) {
  .content {
    /* Ensure content is still visible */
  }
}
```

## Implementation Examples

### Gallery Component

```tsx
// ResponsiveGallery.tsx
export function ResponsiveGallery({ items }: { items: Item[] }) {
  return (
    <div class={`${styles.container} container container-name-gallery`}>
      <div class={styles.grid}>
        {items.map((item) => (
          <div class={styles.item} key={item.id}>
            <img src={item.image} alt={item.title} />
            <div class={styles.content}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```css
/* ResponsiveGallery.module.css */
.container {
  width: 100%;
}

.grid {
  display: grid;
  gap: var(--spacing);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.item {
  display: flex;
  flex-direction: column;
  gap: var(--half-spacing);
  transition: transform var(--transition-duration) var(--transition-timing);
}

.item:hover {
  transform: translateY(-2px);
}

/* Container query for wider layouts */
@container gallery (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--double-spacing);
  }
}

@container gallery (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .item {
    transition: none;
  }

  .item:hover {
    transform: none;
  }
}
```

### Settings Panel

```tsx
// SettingsPanel.tsx
export function SettingsPanel({ children }: { children: JSX.Element }) {
  return (
    <div class={`${styles.container} container container-name-settings`}>
      <div class={styles.panel}>{children}</div>
    </div>
  );
}
```

```css
/* SettingsPanel.module.css */
.container {
  width: 100%;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  padding: var(--spacing);
}

/* Container query for wider panels */
@container settings (min-width: 500px) {
  .panel {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: var(--double-spacing);
    padding: var(--double-spacing);
  }
}

@container settings (min-width: 800px) {
  .panel {
    grid-template-columns: 250px 1fr;
    gap: var(--triple-spacing);
  }
}
```

## Testing Responsive Patterns

### Container Query Testing

```tsx
// Test container queries
test("adapts layout based on container size", () => {
  render(<ResponsiveGallery items={mockItems} />);
  const container = screen.getByRole("main");

  // Test mobile layout
  Object.defineProperty(container, "offsetWidth", { value: 300 });
  expect(container).toHaveClass("flex-col");

  // Test desktop layout
  Object.defineProperty(container, "offsetWidth", { value: 800 });
  expect(container).toHaveClass("grid");
});
```

### Reduced Motion Testing

```tsx
// Test reduced motion support
test("respects reduced motion preference", () => {
  // Mock reduced motion preference
  Object.defineProperty(window, "matchMedia", {
    value: jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
    })),
  });

  render(<AnimatedButton />);
  const button = screen.getByRole("button");

  // Should not have transition styles
  expect(button).not.toHaveStyle({ transition: expect.any(String) });
});
```

## Best Practices Summary

### Do's

- ✅ Use container queries for component-level responsiveness
- ✅ Provide reduced motion alternatives
- ✅ Animate only safe properties outside overlays
- ✅ Use `will-change` only for performance-critical animations
- ✅ Test responsive behavior across different container sizes
- ✅ Ensure accessibility with reduced motion

### Don'ts

- ❌ Don't use layout hacks or brittle calculations
- ❌ Don't animate expensive properties outside overlays
- ❌ Don't use `will-change` unnecessarily
- ❌ Don't rely on animations for critical functionality
- ❌ Don't forget to test with reduced motion preferences
- ❌ Don't create inaccessible animations

## Migration Guidelines

### From Media Query Hacks

```css
/* Before: Brittle media query hack */
.gallery {
  display: flex;
  flex-wrap: wrap;
}

.gallery-item {
  width: calc(33.333% - 20px);
  margin: 10px;
}

/* After: Container query approach */
.gallery-container {
  container-type: inline-size;
}

.gallery {
  display: grid;
  gap: var(--spacing);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

### From Expensive Animations

```css
/* Before: Expensive animation */
.button:hover {
  width: 120px; /* ❌ Triggers layout */
  height: 40px; /* ❌ Triggers layout */
}

/* After: Safe animation */
.button:hover {
  transform: scale(1.05); /* ✅ GPU-accelerated */
}
```

This approach ensures modern, performant, and accessible responsive design patterns throughout the application.
