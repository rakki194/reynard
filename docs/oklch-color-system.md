# 🎨 OKLCH Color System

Reynard uses the **OKLCH color space** exclusively for all color definitions, providing perceptual uniformity and
modern color management capabilities.

## Why OKLCH?

OKLCH (OK Lightness Chroma Hue) is a modern color space that offers several advantages over traditional color systems:

- **Perceptual Uniformity** - Equal changes in OKLCH values produce equal changes in perceived color
- **Better Color Consistency** - Colors maintain their visual relationships across different themes
- **Future-Proof** - OKLCH is the recommended color space for modern web development
- **Wide Gamut Support** - Supports the full P3 color gamut and beyond

## Color Format

OKLCH colors in Reynard use the following format:

```css
oklch(lightness% chroma hue)
```

### Parameters

- **Lightness** (0-100%) - How light or dark the color appears
- **Chroma** (0-0.4+) - How saturated the color is (0 = grayscale, higher = more vivid)
- **Hue** (0-360) - The color's position on the color wheel

### Examples

```css
/* Light blue */
oklch(60% 0.25 240)

/* Dark red */
oklch(40% 0.25 20)

/* Neutral gray */
oklch(50% 0 0)

/* Bright green */
oklch(70% 0.2 140)
```

## Theme Integration

All Reynard themes use OKLCH colors exclusively:

### Light Theme

```css
:root[data-theme="light"] {
  --color-primary: oklch(60% 0.25 240);
  --color-background: oklch(98% 0.01 0);
  --color-text: oklch(15% 0.01 0);
  --color-border: oklch(85% 0.02 0);
}
```

### Dark Theme

```css
:root[data-theme="dark"] {
  --color-primary: oklch(65% 0.25 240);
  --color-background: oklch(15% 0.01 0);
  --color-text: oklch(90% 0.01 0);
  --color-border: oklch(35% 0.02 0);
}
```

### Strawberry Theme

```css
:root[data-theme="strawberry"] {
  --color-primary: oklch(60% 0.25 340);
  --color-background: oklch(95% 0.05 340);
  --color-surface: oklch(90% 0.08 340);
  --color-text: oklch(20% 0.01 0);
}
```

## Color Utilities

Reynard provides utilities for working with OKLCH colors:

### Color Generation

```tsx
import { generateColorPalette } from "reynard-colors";

// Generate 5 colors with base hue 240
const palette = generateColorPalette(5, 240);
// Returns: ['oklch(60% 0.2 240)', 'oklch(60% 0.2 300)', ...]
```

### Color Conversion

```tsx
import { convertToOKLCH } from "reynard-colors";

// Convert hex to OKLCH
const oklchColor = convertToOKLCH("#3b82f6");
// Returns: 'oklch(60% 0.25 240)'
```

### Color Mixing

```css
/* Mix colors using OKLCH color space */
.mixed-color {
  background: color-mix(in oklch, var(--accent) 20%, var(--background));
}
```

## Best Practices

### 1. Use Semantic Color Names

```css
/* Good - semantic naming */
--color-primary: oklch(60% 0.25 240);
--color-success: oklch(60% 0.2 140);
--color-error: oklch(55% 0.25 20);

/* Avoid - specific color values */
--color-blue: oklch(60% 0.25 240);
--color-green: oklch(60% 0.2 140);
--color-red: oklch(55% 0.25 20);
```

### 2. Maintain Consistent Lightness

```css
/* Good - consistent lightness for text hierarchy */
--color-text: oklch(15% 0.01 0);
--color-text-secondary: oklch(30% 0.01 0);
--color-text-tertiary: oklch(50% 0.01 0);

/* Avoid - inconsistent lightness */
--color-text: oklch(15% 0.01 0);
--color-text-secondary: oklch(45% 0.01 0);
--color-text-tertiary: oklch(25% 0.01 0);
```

### 3. Use Appropriate Chroma Values

```css
/* Good - appropriate chroma for different use cases */
--color-primary: oklch(60% 0.25 240); /* High chroma for primary actions */
--color-text: oklch(15% 0.01 0); /* Low chroma for text */
--color-border: oklch(85% 0.02 0); /* Very low chroma for borders */
```

### 4. Leverage Color Mixing

```css
/* Good - use color-mix for variations */
.button-primary {
  background: var(--color-primary);
}

.button-primary:hover {
  background: color-mix(in oklch, var(--color-primary) 85%, oklch(0% 0 0));
}

.button-primary:active {
  background: color-mix(in oklch, var(--color-primary) 70%, oklch(0% 0 0));
}
```

## Browser Support

OKLCH is supported in all modern browsers:

- **Chrome 111+** ✅
- **Firefox 113+** ✅
- **Safari 15.4+** ✅
- **Edge 111+** ✅

For older browsers, Reynard provides fallback values using the `var()` function:

```css
/* Fallback for older browsers */
color: var(--color-text, oklch(15% 0.01 0));
```

## Migration from HSL

If you're migrating from HSL colors, here are some common conversions:

| HSL                   | OKLCH                 | Description  |
| --------------------- | --------------------- | ------------ |
| `hsl(240, 100%, 50%)` | `oklch(60% 0.25 240)` | Pure blue    |
| `hsl(0, 100%, 50%)`   | `oklch(60% 0.25 20)`  | Pure red     |
| `hsl(120, 100%, 50%)` | `oklch(60% 0.25 140)` | Pure green   |
| `hsl(0, 0%, 50%)`     | `oklch(50% 0 0)`      | Neutral gray |

## Tools and Resources

- **[OKLCH Color Picker](https://oklch.com/)** - Visual OKLCH color picker
- **[Color Space Converter](https://colorjs.io/apps/convert/)** - Convert between color spaces
- **[OKLCH in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)** - MDN documentation

## Examples

### Creating a Custom Theme

```css
:root[data-theme="ocean"] {
  --color-primary: oklch(60% 0.25 200);
  --color-secondary: oklch(50% 0.15 200);
  --color-background: oklch(95% 0.02 200);
  --color-surface: oklch(90% 0.05 200);
  --color-text: oklch(20% 0.01 0);
  --color-border: oklch(80% 0.05 200);
}
```

### Dynamic Color Generation

```tsx
import { createSignal } from "solid-js";

function ColorGenerator() {
  const [hue, setHue] = createSignal(240);

  return (
    <div
      style={{
        background: `oklch(60% 0.25 ${hue()})`,
        color: "oklch(95% 0.01 0)",
      }}
    >
      <input
        type="range"
        min="0"
        max="360"
        value={hue()}
        onInput={(e) => setHue(Number(e.target.value))}
      />
    </div>
  );
}
```

The OKLCH color system ensures that Reynard applications have consistent, accessible, and
visually appealing color schemes across all themes and components.
