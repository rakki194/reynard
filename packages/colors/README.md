# reynard-colors

A comprehensive package for color generation and theme management using OKLCH color space.

## Features

### 🎨 Color Generation

- **OKLCH Color Space**: Perceptually uniform color generation for consistent theming
- **Tag-based Colors**: Deterministic color generation based on text tags
- **Theme-aware Colors**: Automatic color adjustment based on light/dark themes
- **Color Palettes**: Generate harmonious color palettes and complementary colors
- **Color Manipulation**: Adjust lightness, saturation, and other color properties

### 🌓 Theme Management

- **Multiple Themes**: Support for dark, light, gray, banana, strawberry, and peanut themes
- **Theme Persistence**: Automatic theme saving to localStorage
- **Theme Rotation**: Easy theme switching with rotation helpers
- **Theme Metadata**: Rich theme information for UI display

### 🎨 Advanced Color Features

- **Perceptually Uniform**: OKLCH color space for consistent visual appearance
- **Theme Integration**: Seamless integration with Reynard's theme system
- **Performance Optimized**: Cached color generation for optimal performance
- **Accessibility**: WCAG-compliant color contrast calculations

## Installation

```bash
npm install reynard-colors
```

## Usage

### Color Generation

```typescript
import { createTagColorGenerator, formatOKLCH } from "reynard-colors";

// Create a color generator
const colorGenerator = createTagColorGenerator();

// Generate colors for tags
const tagColor = colorGenerator.getTagColor("dark", "javascript", 1.0);
const cssColor = formatOKLCH(tagColor); // "oklch(25% 0.1 240)"

// Generate color palettes
import { generateColorPalette } from "reynard-colors";
const palette = generateColorPalette(5, 0, 0.3, 0.6);
```

### Theme Management

```typescript
import { createThemeContext, getStoredTheme } from "reynard-colors";

// Create a theme context
const themeContext = createThemeContext();

// Get current theme
const currentTheme = themeContext.theme;

// Change theme
themeContext.setTheme("dark");

// Get tag styles for current theme
const tagStyle = themeContext.getTagStyle("react");
// Returns: { backgroundColor: "...", color: "...", hoverStyles: {...}, animation: "..." }
```

### Color Manipulation

```typescript
import { 
  adjustLightness, 
  adjustSaturation, 
  generateComplementaryColors 
} from "reynard-colors";

// Adjust color properties
const darkerColor = adjustLightness(baseColor, -10);
const moreSaturated = adjustSaturation(baseColor, 0.1);

// Generate complementary colors
const complementary = generateComplementaryColors(baseColor);
```

### Advanced Color Features

```typescript
import { 
  createTagColorGenerator, 
  generateColorPalette,
  formatOKLCH 
} from "reynard-colors";

// Create a color generator with custom settings
const colorGenerator = createTagColorGenerator({
  baseSaturation: 0.3,
  baseLightness: 0.6,
  hueVariation: 0.1
});

// Generate a harmonious color palette
const palette = generateColorPalette(5, 240, 0.3, 0.6);
const cssColors = palette.map(formatOKLCH);
```

## API Reference

### Color Utilities

#### `createTagColorGenerator()`

Creates a color generator with caching for performance.

#### `formatOKLCH(color: OKLCHColor): string`

Formats an OKLCH color object into a CSS color string.

#### `generateColorPalette(count: number, baseHue?: number, saturation?: number, lightness?: number): string[]`

Generates a color palette with the specified number of colors.

#### `generateComplementaryColors(baseColor: OKLCHColor): OKLCHColor[]`

Generates complementary colors based on a base color.

### Theme Utilities

#### `createThemeContext(initialTheme?: ThemeName): ThemeContext`

Creates a theme context object for managing theme state.

#### `getStoredTheme(): ThemeName`

Gets the current theme from localStorage or returns the default.

#### `setStoredTheme(theme: ThemeName): void`

Sets the theme in localStorage and updates the document attribute.

#### `getTagStyle(theme: ThemeName, tag: string)`

Gets the complete tag style object for a given theme and tag.

### Color Manipulation Utilities

#### `adjustLightness(color: OKLCHColor, adjustment: number): OKLCHColor`

Adjusts the lightness of an OKLCH color.

#### `adjustSaturation(color: OKLCHColor, adjustment: number): OKLCHColor`

Adjusts the saturation of an OKLCH color.

#### `generateComplementaryColors(baseColor: OKLCHColor): OKLCHColor[]`

Generates complementary colors based on a base color.

#### `generateColorPalette(count: number, baseHue?: number, saturation?: number, lightness?: number): string[]`

Generates a harmonious color palette with the specified number of colors.

## Color Space Support

### OKLCH Color Space

The package uses OKLCH (OK Lightness, Chroma, Hue) color space for:

- **Perceptual Uniformity**: Colors appear more consistent across different displays
- **Better Gradients**: Smoother color transitions and gradients
- **Accessibility**: Better support for color contrast calculations
- **Modern CSS**: Native support in modern browsers

### Color Format Support

- **OKLCH**: Primary color format for internal processing
- **CSS Strings**: Automatic conversion to CSS-compatible color strings
- **Hex**: Support for traditional hex color values
- **RGB/HSL**: Conversion utilities for legacy color formats

## Themes

The package includes several pre-built themes:

- **Dark**: High contrast dark theme
- **Light**: Clean light theme
- **Gray**: Monochromatic gray theme
- **Banana**: Warm yellow and cream theme
- **Strawberry**: Red and pink with green accents
- **Peanut**: Warm brown and tan theme

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the LICENSE file for details.
