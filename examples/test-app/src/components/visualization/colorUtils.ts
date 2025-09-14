/**
 * 🦊 Color Utilities
 * OKLCH to RGB conversion for Three.js compatibility
 */

export interface OKLCHColor {
  l: number;
  c: number;
  h: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert OKLCH to RGB for Three.js compatibility
 */
export function oklchToRgb(oklch: any): RGBColor {
  // Handle different OKLCH formats
  let l, c, h;

  if (typeof oklch === "string") {
    // Parse OKLCH string like "oklch(95% 0.05 340)"
    const match = oklch.match(/oklch\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(/\s+/);
      l = parseFloat(values[0]) / 100; // Convert percentage to decimal
      c = parseFloat(values[1]);
      h = parseFloat(values[2]);
    } else {
      // Fallback to white
      return { r: 1, g: 1, b: 1 };
    }
  } else if (oklch && typeof oklch === "object") {
    l = oklch.l || oklch.lightness || 0.5;
    c = oklch.c || oklch.chroma || 0;
    h = oklch.h || oklch.hue || 0;
  } else {
    // Fallback to white
    return { r: 1, g: 1, b: 1 };
  }

  // Convert OKLCH to RGB using a more accurate conversion
  // This is a simplified conversion - for production use a proper color library
  const hueRad = (h * Math.PI) / 180;
  const chroma = Math.max(0, Math.min(0.4, c)); // Clamp chroma
  const lightness = Math.max(0, Math.min(1, l)); // Clamp lightness

  // Convert to RGB (simplified approximation)
  const r = Math.max(0, Math.min(1, lightness + chroma * Math.cos(hueRad)));
  const g = Math.max(
    0,
    Math.min(1, lightness + chroma * Math.cos(hueRad - (2 * Math.PI) / 3)),
  );
  const b = Math.max(
    0,
    Math.min(1, lightness + chroma * Math.cos(hueRad + (2 * Math.PI) / 3)),
  );

  return { r, g, b };
}

/**
 * Convert OKLCH color to RGB string for CSS/Three.js
 */
export function oklchToRgbString(oklch: any): string {
  const rgb = oklchToRgb(oklch);
  return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
}
