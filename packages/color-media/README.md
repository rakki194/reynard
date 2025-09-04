# @reynard/color-media

A comprehensive package for color generation, theme management, and media handling using OKLCH color space.

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

### 📱 Media Modalities

- **File Type Detection**: Automatic detection of image, audio, video, and text files
- **Modality Registry**: Centralized management of different content types
- **File Validation**: Built-in file extension validation
- **Utility Functions**: File size formatting, duration formatting, and more

## Installation

```bash
npm install @reynard/color-media
```

## Usage

### Color Generation

```typescript
import { createTagColorGenerator, formatOKLCH } from "@reynard/color-media";

// Create a color generator
const colorGenerator = createTagColorGenerator();

// Generate colors for tags
const tagColor = colorGenerator.getTagColor("dark", "javascript", 1.0);
const cssColor = formatOKLCH(tagColor); // "oklch(25% 0.1 240)"

// Generate color palettes
import { generateColorPalette } from "@reynard/color-media";
const palette = generateColorPalette(5, 0, 0.3, 0.6);
```

### Theme Management

```typescript
import { createThemeContext, getStoredTheme } from "@reynard/color-media";

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

### Media Modalities

```typescript
import {
  BaseModality,
  ModalityRegistry,
  isImageFile,
  isAudioFile,
} from "@reynard/color-media";

// Check file types
const file = new File([""], "image.jpg");
console.log(isImageFile(file)); // true
console.log(isAudioFile(file)); // false

// Create modality registry
const registry = new ModalityRegistry();

// Register custom modality
class CustomModality extends BaseModality {
  readonly id = "custom";
  readonly name = "Custom";
  readonly icon = "custom-icon";
  readonly description = "Custom modality for special files";
  readonly enabled = true;
  readonly fileExtensions = [".custom"];
  readonly supportedFunctionalities = ["view", "edit"];
  readonly component = CustomComponent;
}

registry.registerModality(new CustomModality());
```

### File Utilities

```typescript
import { formatFileSize, formatDuration } from "@reynard/color-media";

// Format file sizes
console.log(formatFileSize(1024)); // "1 KB"
console.log(formatFileSize(1048576)); // "1 MB"

// Format durations
console.log(formatDuration(65)); // "1:05"
console.log(formatDuration(3661)); // "1:01:01"
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

### Modality Utilities

#### `BaseModality`

Abstract base class for implementing modalities.

#### `ModalityRegistry`

Class for managing all available modalities.

#### `isImageFile(file: File): boolean`

Checks if a file is an image file.

#### `isAudioFile(file: File): boolean`

Checks if a file is an audio file.

#### `isVideoFile(file: File): boolean`

Checks if a file is a video file.

#### `isTextFile(file: File): boolean`

Checks if a file is a text file.

## Supported File Types

### Images

- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff`, `.svg`

### Audio

- `.mp3`, `.wav`, `.flac`, `.aac`, `.ogg`, `.m4a`, `.wma`, `.opus`

### Video

- `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`, `.m4v`

### Text

- `.txt`, `.md`, `.json`, `.xml`, `.html`, `.css`, `.js`, `.ts`, `.tsx`

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
