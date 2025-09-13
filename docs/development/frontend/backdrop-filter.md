# Backdrop Filter Usage Guidelines

The `backdrop-filter` CSS property is used throughout yipyap to create depth and visual hierarchy through blurring and
other filter effects on elements' backgrounds. This document outlines the standard practices for
using backdrop filters in the application.

## Table of Contents

---

- [Backdrop Filter Usage Guidelines](#backdrop-filter-usage-guidelines)
  - [Table of Contents](#table-of-contents)
  - [Global Variables](#global-variables)
  - [Usage Patterns](#usage-patterns)
    - [Standard Overlays](#standard-overlays)
    - [Blur Effects](#blur-effects)
    - [Theme-Specific Effects](#theme-specific-effects)
  - [Performance Considerations](#performance-considerations)
  - [Browser Support](#browser-support)

## Global Variables

---

The application defines tokens for consistent backdrop effects:

```css
--backdrop-blur: 10px;
--backdrop-opacity: 0.2;
--backdrop-saturation: 0.5;
```

And `src/styles.css` derives overlay variables used by components:

```css
--overlay-bg: rgb(0 0 0 / var(--backdrop-opacity));
--overlay-backdrop: brightness(0.5) saturate(var(--backdrop-saturation));
```

## Usage Patterns

---

### Standard Overlays

For standard overlays (modals, dialogs, etc.), use the global variable:

```css
backdrop-filter: var(--overlay-backdrop);
```

### Blur Effects

When applying blur effects, use these standard values (override via tokens when needed):

- Light blur (UI elements): `blur(2px)`
- Medium blur (modal backgrounds): `blur(4px)`
- Heavy blur (full overlays): `blur(8px-10px)`

### Theme-Specific Effects

Theme-specific backdrop filters should be defined in the theme's scope and
should enhance the theme's visual identity. For example:

```css
:root[data-theme="christmas"] {
  .modal-header {
    backdrop-filter: blur(10px);
  }
}
```

## Performance Considerations

---

Always check for support using `@supports` and provide graceful fallbacks:

```css
@supports (backdrop-filter: blur(10px)) {
  /* backdrop-filter styles */
}
```

When implementing backdrop filters, be mindful of
performance implications. Each additional filter increases processing overhead, so
combine them judiciously. For elements with animated backdrop filters,
enable hardware acceleration by adding `will-change: backdrop-filter` to
improve performance. Avoid creating unintended stacking contexts;
prefer using z-index tokens such as `var(--z-modal)` when
necessary. Always implement appropriate fallback styles where `backdrop-filter` is unsupported.

## Browser Support

---

The `backdrop-filter` property is widely supported in modern browsers but
may require vendor prefixes in some cases. Always test across different browsers when
implementing new backdrop filter effects.
