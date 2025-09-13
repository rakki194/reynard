# OKLCH Hue Shifting Demo

An interactive demonstration of OKLCH-based hue shifting algorithms for pixel art games, built with SolidJS and
integrated with the Reynard framework.

## Features

- **Interactive Color Picker**: Real-time OKLCH color selection with visual feedback
- **Material-Based Shifting**: Different hue shifting patterns for various materials (metal, skin, fabric, plastic)
- **Pixel Art Preview**: Live preview of sprites with hue shifting applied
- **Color Ramp Generation**: Generate and export color palettes
- **Performance Comparison**: Compare RGB vs OKLCH approaches
- **Export Functionality**: Copy colors and export as CSS variables

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Usage

### Basic Hue Shifting

1. **Select Base Color**: Use the color picker to choose your base color
2. **Choose Material**: Select the material type (metal, skin, fabric, plastic, or custom)
3. **Adjust Intensity**: Control how much the hue shifts between shadows and highlights
4. **View Results**: See real-time updates in the pixel art preview

### Material Types

- **Metal**: Cool shadows, warm highlights, high chroma boost
- **Skin**: Warm shadows and highlights, moderate chroma
- **Fabric**: Subtle hue shifts, low chroma boost
- **Plastic**: Moderate shifts, high chroma boost
- **Custom**: Manual control over all parameters

### Export Options

- **Copy Individual Colors**: Click on any color swatch to copy its OKLCH value
- **Copy All Colors**: Export the entire color ramp
- **CSS Variables**: Generate CSS custom properties for your project

## Technical Details

### OKLCH Color Space

This demo uses the OKLCH color space, which provides:

- **Perceptual Uniformity**: Equal changes produce equal visual changes
- **Better Gradients**: Smoother color transitions
- **Wide Gamut Support**: Access to colors outside sRGB
- **Modern Browser Support**: Native CSS support

### Integration with Reynard

The demo integrates with Reynard's color system:

```typescript
import { OKLCHColor } from "reynard-colors";
import { basicColorRamp, materialHueShift } from "./algorithms";
```

### Performance

- **Real-time Updates**: Optimized for smooth 60fps interactions
- **Caching**: Color calculations are cached for performance
- **Responsive**: Works on desktop and mobile devices

## File Structure

```
src/
├── components/
│   ├── ColorPicker.tsx          # OKLCH color picker
│   ├── MaterialSelector.tsx     # Material type selection
│   ├── HueShiftControls.tsx     # Intensity and ramp controls
│   ├── ColorRamp.tsx           # Color palette display
│   ├── PixelArtPreview.tsx     # Sprite preview with hue shifting
│   └── Navigation.tsx          # App navigation
├── App.tsx                     # Main app component
├── App.css                     # Global styles
└── main.tsx                    # App entry point
```

## Browser Support

- Chrome 111+
- Firefox 113+
- Safari 15.4+
- Edge 111+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Reynard framework and follows the same licensing terms.

## Related Documentation

- [OKLCH Hue Shifting Algorithms](../../docs/research/algorithms/oklch-hue-shifting-pixel-art/README.md)
- [Reynard Color System](../../packages/colors/README.md)
- [SolidJS Documentation](https://solidjs.com)
