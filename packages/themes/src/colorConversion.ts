/**
 * Color Conversion Utilities
 * Provides color format conversion functions with native OKLCH CSS support
 *
 * Note: For CSS usage, prefer native OKLCH functions as modern browsers support oklch() natively.
 * RGB conversion functions are kept for non-CSS use cases (e.g., canvas, image processing).
 */

/**
 * OKLCH color interface
 */
export interface OKLCH {
  l: number; // Lightness (0-1)
  c: number; // Chroma (0-0.4+)
  h: number; // Hue in degrees (0-360)
}

/**
 * RGB color interface
 */
export interface RGB {
  r: number; // Red channel (0-255)
  g: number; // Green channel (0-255)
  b: number; // Blue channel (0-255)
}

/**
 * Parse OKLCH string and return OKLCH object
 */
function parseOKLCH(oklchString: string): OKLCH | null {
  // Match OKLCH format: oklch(lightness% chroma hue) - handle negative hue values
  const match = oklchString.match(
    /oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+(-?[0-9.]+)\s*\)/i,
  );
  if (!match) {
    return null;
  }

  const [, l, c, h] = match;
  const lightness = parseFloat(l);
  const chroma = parseFloat(c);
  const hue = parseFloat(h);

  // Validate ranges
  if (lightness < 0 || lightness > 100 || chroma < 0) {
    return null;
  }

  // Normalize hue to 0-360 range (negative values are valid and wrap around)
  const normalizedHue = ((hue % 360) + 360) % 360;

  return {
    l: lightness / 100, // Convert to 0-1 range
    c: chroma,
    h: normalizedHue,
  };
}

/**
 * Apply gamma correction for sRGB
 */
function gammaCorrect(value: number): number {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

/**
 * Clamp value between 0 and 1, then scale to 0-255
 */
function clampAndScale(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 255);
}

/**
 * Convert OKLCH to RGB using proper color space mathematics
 * Based on the OKLCH to sRGB conversion algorithm
 */
export function oklchToRgb(oklch: OKLCH): RGB {
  const { l, c, h } = oklch;

  // Convert hue from degrees to radians
  const hRad = (h * Math.PI) / 180;

  // Convert OKLCH to OKLAB
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLAB to linear sRGB conversion matrix
  // This is the proper conversion matrix for OKLAB to linear sRGB
  const l_linear = l;
  const a_linear = a;
  const b_linear = b;

  // Convert OKLAB to linear sRGB using the official conversion matrix
  const r_linear = l_linear + 0.3963377774 * a_linear + 0.2158037573 * b_linear;
  const g_linear = l_linear - 0.1055613458 * a_linear - 0.0638541728 * b_linear;
  const b_linear_srgb =
    l_linear - 0.0894841775 * a_linear - 1.291485548 * b_linear;

  // Apply gamma correction to convert from linear sRGB to sRGB
  const r_gamma = gammaCorrect(r_linear);
  const g_gamma = gammaCorrect(g_linear);
  const b_gamma = gammaCorrect(b_linear_srgb);

  // Clamp and scale to 0-255 range
  return {
    r: clampAndScale(r_gamma),
    g: clampAndScale(g_gamma),
    b: clampAndScale(b_gamma),
  };
}

/**
 * Convert OKLCH string to native OKLCH CSS format
 * This function validates and normalizes OKLCH strings for CSS usage
 *
 * @param oklchColor - OKLCH color string (e.g., "oklch(70% 0.2 120)")
 * @returns Validated OKLCH CSS string or fallback
 */
export function oklchStringToCSS(oklchColor: string): string {
  const oklch = parseOKLCH(oklchColor);
  if (!oklch) {
    // Fallback to a default color if parsing fails
    console.warn(`Invalid OKLCH color format: ${oklchColor}`);
    return "oklch(40% 0.02 0)"; // Neutral gray fallback
  }

  // Return normalized OKLCH CSS format with proper rounding
  return `oklch(${Math.round(oklch.l * 100)}% ${oklch.c} ${Math.round(oklch.h * 10) / 10})`;
}

/**
 * Convert OKLCH string to RGB string for non-CSS use cases
 * This function parses OKLCH strings and converts them to RGB format
 *
 * @deprecated For CSS usage, prefer oklchStringToCSS() as modern browsers support oklch() natively
 */
export function oklchStringToRgb(oklchColor: string): string {
  const oklch = parseOKLCH(oklchColor);
  if (!oklch) {
    // Fallback to a default color if parsing fails
    console.warn(`Invalid OKLCH color format: ${oklchColor}`);
    return "#666666";
  }

  const rgb = oklchToRgb(oklch);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Convert OKLCH string to native OKLCH CSS format with alpha support
 * This function validates and normalizes OKLCH strings for CSS usage with opacity
 *
 * @param oklchColor - OKLCH color string (e.g., "oklch(70% 0.2 120)")
 * @param alpha - Alpha value (0-1)
 * @returns Validated OKLCH CSS string with alpha or fallback
 */
export function oklchStringToCSSWithAlpha(
  oklchColor: string,
  alpha: number = 1,
): string {
  const oklch = parseOKLCH(oklchColor);
  if (!oklch) {
    // Fallback to a default color if parsing fails
    console.warn(`Invalid OKLCH color format: ${oklchColor}`);
    return `oklch(40% 0.02 0 / ${alpha})`;
  }

  // Clamp alpha to valid range
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  // Return normalized OKLCH CSS format with alpha and proper rounding
  return `oklch(${Math.round(oklch.l * 100)}% ${oklch.c} ${Math.round(oklch.h * 10) / 10} / ${clampedAlpha})`;
}

/**
 * Convert OKLCH string to hex color for maximum browser compatibility
 *
 * @deprecated For CSS usage, prefer oklchStringToCSS() as modern browsers support oklch() natively
 */
export function oklchStringToHex(oklchColor: string): string {
  const oklch = parseOKLCH(oklchColor);
  if (!oklch) {
    console.warn(`Invalid OKLCH color format: ${oklchColor}`);
    return "#666666";
  }

  const rgb = oklchToRgb(oklch);
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}
