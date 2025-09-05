# Migration Guide

A comprehensive guide for migrating applications to use the new Reynard theming and icon systems.

## Table of Contents

- [Overview](#overview)
- [From yipyap](#from-yipyap)
- [From Other Frameworks](#from-other-frameworks)
- [Step-by-Step Migration](#step-by-step-migration)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

## Overview

This guide covers migrating applications to use the new Reynard theming and icon systems. The migration process is designed to be gradual and non-breaking, allowing you to migrate incrementally.

## From yipyap

### Provider Migration

**Before (yipyap):**

```tsx
import { ThemeProvider, I18nProvider, NotificationsProvider } from "yipyap";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <I18nProvider defaultLocale="en">
        <NotificationsProvider>
          <YourApp />
        </NotificationsProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
```

**After (Reynard):**

```tsx
import { ReynardProvider } from "@reynard/themes";

function App() {
  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <YourApp />
    </ReynardProvider>
  );
}
```

### Hook Migration

**Before (yipyap):**

```tsx
import { useTheme, useI18n, useNotifications } from "yipyap";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useI18n();
  const { addNotification } = useNotifications();

  return (
    <div>
      <button onClick={() => setTheme("dark")}>Switch to Dark Mode</button>
      <p>{t("welcome.message")}</p>
    </div>
  );
}
```

**After (Reynard):**

```tsx
import { useTheme, useTranslation, useNotifications } from "@reynard/themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useTranslation();
  const { addNotification } = useNotifications();

  return (
    <div>
      <button onClick={() => setTheme("dark")}>Switch to Dark Mode</button>
      <p>{t("welcome.message")}</p>
    </div>
  );
}
```

### Icon Migration

**Before (yipyap):**

```tsx
function MyComponent() {
  return (
    <div>
      <span>🦊</span>
      <span>💾</span>
      <span>🔍</span>
    </div>
  );
}
```

**After (Reynard):**

```tsx
import { getIcon } from "@reynard/fluent-icons";

function MyComponent() {
  return (
    <div>
      <span innerHTML={getIcon("yipyap")}></span>
      <span innerHTML={getIcon("save")}></span>
      <span innerHTML={getIcon("search")}></span>
    </div>
  );
}
```

### CSS Migration

**Before (yipyap):**

```css
.my-component {
  background-color: var(--yipyap-color-primary);
  color: var(--yipyap-color-text);
  padding: var(--yipyap-spacing-md);
}
```

**After (Reynard):**

```css
.my-component {
  background-color: var(--color-primary);
  color: var(--color-text);
  padding: var(--spacing-md);
}
```

## From Other Frameworks

### React Applications

**Before (React):**

```tsx
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";

function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeProvider theme={themes[theme]}>
      <YourApp />
    </ThemeProvider>
  );
}
```

**After (Reynard):**

```tsx
import { ReynardProvider } from "@reynard/themes";

function App() {
  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <YourApp />
    </ReynardProvider>
  );
}
```

### Vue Applications

**Before (Vue):**

```vue
<template>
  <div :class="themeClass">
    <YourApp />
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  setup() {
    const theme = ref("light");
    const themeClass = computed(() => `theme-${theme.value}`);

    return { theme, themeClass };
  },
};
</script>
```

**After (Reynard):**

```tsx
import { ReynardProvider, useTheme } from "@reynard/themes";

function App() {
  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <YourApp />
    </ReynardProvider>
  );
}
```

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
npm install @reynard/themes @reynard/fluent-icons
```

### Step 2: Update Provider Setup

Replace your existing provider setup with the unified `ReynardProvider`:

```tsx
// Remove old providers
// import { ThemeProvider, I18nProvider } from 'old-package';

// Add new provider
import { ReynardProvider } from "@reynard/themes";
import "@reynard/themes/themes.css";

function App() {
  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <YourApp />
    </ReynardProvider>
  );
}
```

### Step 3: Update Hook Imports

Update your hook imports to use the new Reynard hooks:

```tsx
// Before
import { useTheme, useI18n } from "old-package";

// After
import { useTheme, useTranslation } from "@reynard/themes";
```

### Step 4: Replace Emoji Icons

Replace all emoji icons with Fluent UI icons:

```tsx
// Before
<span>🦊</span>
<span>💾</span>
<span>🔍</span>

// After
import { getIcon } from '@reynard/fluent-icons';

<span innerHTML={getIcon('yipyap')}></span>
<span innerHTML={getIcon('save')}></span>
<span innerHTML={getIcon('search')}></span>
```

### Step 5: Update CSS Variables

Update your CSS to use the new CSS custom properties:

```css
/* Before */
.my-component {
  background-color: var(--old-color-primary);
  color: var(--old-color-text);
}

/* After */
.my-component {
  background-color: var(--color-primary);
  color: var(--color-text);
}
```

### Step 6: Update Component Styling

Add CSS for icon display:

```css
.icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}

.icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
```

### Step 7: Test and Verify

1. **Run Tests**: Ensure all tests pass
2. **Check Functionality**: Verify all features work
3. **Test Themes**: Switch between themes
4. **Test Icons**: Verify all icons display correctly
5. **Check Accessibility**: Ensure accessibility features work

## Common Issues

### Issue 1: Icons Not Displaying

**Problem:** Icons appear as empty spaces or broken images.

**Solution:** Ensure you're using `innerHTML` to render SVG content:

```tsx
// Wrong
<span>{getIcon('save')}</span>

// Correct
<span innerHTML={getIcon('save')}></span>
```

### Issue 2: Theme Not Switching

**Problem:** Theme changes don't apply to components.

**Solution:** Ensure you're using CSS custom properties:

```css
/* Wrong */
.my-component {
  background-color: #ffffff;
}

/* Correct */
.my-component {
  background-color: var(--color-background);
}
```

### Issue 3: TypeScript Errors

**Problem:** TypeScript errors when importing from new packages.

**Solution:** Ensure you have the correct type definitions:

```tsx
// Make sure you're importing from the correct package
import { useTheme } from "@reynard/themes";
import { getIcon } from "@reynard/fluent-icons";
```

### Issue 4: CSS Variables Not Working

**Problem:** CSS custom properties don't apply.

**Solution:** Ensure you're importing the themes CSS:

```tsx
import "@reynard/themes/themes.css";
```

### Issue 5: Icons Not Found

**Problem:** `getIcon()` returns undefined.

**Solution:** Check that the icon name exists:

```tsx
// Check available icons
import { allIcons } from "@reynard/fluent-icons";
console.log(Object.keys(allIcons));

// Use correct icon name
const icon = getIcon("save"); // Not 'save-icon' or 'Save'
```

## Best Practices

### 1. Gradual Migration

Migrate incrementally rather than all at once:

```tsx
// Start with one component
function MyComponent() {
  // Keep old code working
  const oldTheme = useOldTheme();

  // Add new code alongside
  const { theme } = useTheme();

  // Gradually replace old with new
  return <div>...</div>;
}
```

### 2. Icon Organization

Organize icons by category for better maintainability:

```tsx
// Group related icons
import { actionsIcons, navigationIcons } from "@reynard/fluent-icons";

function ActionBar() {
  return (
    <div>
      <button innerHTML={actionsIcons.save}></button>
      <button innerHTML={actionsIcons.delete}></button>
      <button innerHTML={navigationIcons.back}></button>
    </div>
  );
}
```

### 3. Theme-Aware Components

Create components that automatically adapt to themes:

```tsx
function ThemedButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-primary-text)",
        border: "1px solid var(--color-border)",
      }}
    >
      {children}
    </button>
  );
}
```

### 4. Icon Components

Create reusable icon components:

```tsx
interface IconProps {
  name: string;
  size?: string;
  color?: string;
}

function Icon({ name, size = "1em", color = "currentColor" }: IconProps) {
  const iconSvg = getIcon(name);

  return (
    <span
      class="icon"
      style={{ width: size, height: size, color }}
      innerHTML={iconSvg}
    />
  );
}
```

### 5. Error Handling

Handle missing icons gracefully:

```tsx
function SafeIcon({
  name,
  fallback = "question",
}: {
  name: string;
  fallback?: string;
}) {
  const iconSvg = getIcon(name) || getIcon(fallback);

  if (!iconSvg) {
    console.warn(`Icon "${name}" not found`);
    return <span>?</span>;
  }

  return <span innerHTML={iconSvg}></span>;
}
```

### 6. Performance Optimization

Optimize icon loading for better performance:

```tsx
import { createMemo } from "solid-js";

function OptimizedIcon({ name }: { name: string }) {
  // Memoize icon loading
  const iconSvg = createMemo(() => getIcon(name));

  return <span innerHTML={iconSvg()}></span>;
}
```

### 7. Testing

Test your migrated components:

```tsx
import { render } from "@testing-library/solid-js";
import { ReynardProvider } from "@reynard/themes";

function renderWithProviders(component: JSX.Element) {
  return render(() => (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      {component}
    </ReynardProvider>
  ));
}

test("component renders with theme", () => {
  renderWithProviders(<MyComponent />);
  // Test assertions
});
```

## Migration Checklist

- [ ] Install new dependencies
- [ ] Update provider setup
- [ ] Replace hook imports
- [ ] Replace emoji icons with Fluent UI icons
- [ ] Update CSS variables
- [ ] Add icon styling
- [ ] Test theme switching
- [ ] Test icon display
- [ ] Verify accessibility
- [ ] Update tests
- [ ] Update documentation
- [ ] Performance testing
- [ ] Cross-browser testing

## Support

If you encounter issues during migration:

1. **Check Documentation**: Review the package README files
2. **Search Issues**: Look for similar issues in the repository
3. **Create Issue**: Report bugs or ask questions
4. **Community**: Join the community discussions

## Conclusion

The migration to Reynard's theming and icon systems provides:

- **Better Performance**: Optimized bundle sizes and runtime performance
- **Improved Accessibility**: Built-in accessibility features
- **Enhanced Developer Experience**: Better TypeScript support and tooling
- **Consistent Design**: Unified design system across applications
- **Future-Proof**: Modern architecture with room for growth

Take your time with the migration, test thoroughly, and don't hesitate to ask for help if you encounter issues.
