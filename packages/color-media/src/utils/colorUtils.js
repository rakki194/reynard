/**
 * Color utility functions for OKLCH color space
 * Provides consistent color generation and manipulation
 */
/**
 * Generate a hash from a string for consistent color generation
 * @param str - The string to hash
 * @returns A numeric hash value
 */
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}
/**
 * Generate LCH color values from a tag string
 * @param tag - The tag to generate color for
 * @returns LCH color object
 */
export function getLCHColor(tag) {
  const hash = hashString(tag);
  return {
    l: 65 + (hash % 20), // Lightness: 65-85
    c: 40 + (hash % 40), // Chroma: 40-80
    h: hash % 360, // Hue: 0-360
  };
}
/**
 * Compute tag background color based on theme and tag
 * @param theme - The current theme
 * @param tag - The tag text
 * @returns CSS color string
 */
export function computeTagBackground(theme, tag) {
  const { l, c, h } = getLCHColor(tag);
  // Adjust lightness based on theme
  const lightness = theme === "dark" ? l * 0.7 : l;
  return `oklch(${lightness}% ${c} ${h})`;
}
/**
 * Compute tag text color based on theme and tag
 * @param theme - The current theme
 * @param tag - The tag text
 * @returns CSS color string
 */
export function computeTagColor(theme, tag) {
  const { l } = getLCHColor(tag);
  // For dark theme, use lighter text
  if (theme === "dark") {
    return l < 60 ? "rgb(240, 240, 240)" : "rgb(20, 20, 20)";
  }
  // For light theme, ensure contrast
  return l > 65 ? "rgb(20, 20, 20)" : "rgb(240, 240, 240)";
}
/**
 * Compute hover styles based on theme
 * @param theme - The current theme
 * @returns Object with CSS properties for hover effects
 */
export function computeHoverStyles(theme) {
  switch (theme) {
    case "dark":
      return {
        filter: "brightness(1.2)",
        transform: "scale(1.05)",
      };
    case "light":
      return {
        filter: "brightness(0.9)",
        transform: "scale(1.05)",
      };
    default:
      return {
        filter: "brightness(1.1)",
        transform: "scale(1.05)",
      };
  }
}
/**
 * Compute animation style based on theme
 * @param theme - The current theme
 * @returns Animation identifier
 */
export function computeAnimation(theme) {
  switch (theme) {
    case "dark":
      return "moon";
    case "light":
      return "sun";
    case "gray":
      return "cloud";
    case "banana":
      return "banana";
    case "strawberry":
      return "strawberry";
    case "peanut":
      return "peanut";
    default:
      return "sun";
  }
}
/**
 * Format OKLCH color object into CSS color string
 * @param color - OKLCH color object
 * @returns CSS color string in OKLCH format
 */
export function formatOKLCH(color) {
  return `oklch(${color.l}% ${color.c} ${color.h})`;
}
/**
 * Create a tag color generator with caching for performance
 * @returns Object with methods to generate and cache tag colors
 */
export function createTagColorGenerator() {
  const colorCache = new Map();
  return {
    getTagColor(theme, tag, colorIntensity = 1.0) {
      // Normalize the tag by replacing spaces with underscores for consistent hashing
      const normalizedTag = tag.replace(/\s+/g, "_");
      const cacheKey = `${theme}:${normalizedTag}:${colorIntensity}`;
      // Return cached color if available
      const cachedColor = colorCache.get(cacheKey);
      if (cachedColor) {
        return cachedColor;
      }
      /**
       * Generate a deterministic hash from the normalized tag string
       * This ensures the same tag always gets the same color
       * The hash is used to vary hue, lightness, and chroma values
       */
      let hash = 0;
      for (let i = 0; i < normalizedTag.length; i++) {
        hash = normalizedTag.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = hash % 360;
      // Theme-specific color generation
      const color = (() => {
        switch (theme) {
          case "dark":
            // Dark theme: Low lightness for dark background, subtle color variations
            return { l: 25, c: 0.1 * colorIntensity, h: hue };
          case "light":
            // Light theme: High lightness for light background, subtle color variations
            return { l: 85, c: 0.1 * colorIntensity, h: hue };
          case "gray":
            // Gray theme: Variable lightness, no chroma for pure grayscale
            return { l: 40 + (hash % 40), c: 0.0, h: hue };
          case "banana":
            // Banana theme: Warm yellows and creams
            return {
              l: 75 + (hash % 15), // High lightness range: 75-90%
              c: (0.15 + (hash % 10) / 100) * colorIntensity, // Subtle chroma variations
              h: 40 + (hash % 40), // Hue range: 40-80 (yellow to orange)
            };
          case "strawberry": {
            // Strawberry theme: Red/pink with green accents
            const strawberryHues = [350, 335, 15, 120, 150]; // Red, pink, coral, green hues
            const selectedStrawberryHue =
              strawberryHues[hash % strawberryHues.length];
            const isGreen = selectedStrawberryHue >= 120;
            return isGreen
              ? {
                  l: 35 + (hash % 10), // Dark background for green (white text)
                  c: (0.25 + (hash % 10) / 100) * colorIntensity, // Saturated green
                  h: selectedStrawberryHue,
                }
              : {
                  l: 75 + (hash % 15), // Light background for pink/red (black text)
                  c: (0.2 + (hash % 15) / 100) * colorIntensity, // Variable saturation for pink/red
                  h: selectedStrawberryHue,
                };
          }
          case "peanut":
            // Peanut theme: Warm browns and tans
            return {
              l: 35 + (hash % 15), // Mid-range lightness
              c: (0.15 + (hash % 10) / 100) * colorIntensity, // Moderate chroma
              h: 20 + (hash % 30), // Brown hue range
            };
          default:
            // Default theme: Soft, neutral colors
            return { l: 80, c: 0.12 * colorIntensity, h: hue };
        }
      })();
      // Cache and return the computed color
      colorCache.set(cacheKey, color);
      return color;
    },
    // Add method to clear the cache
    clearCache() {
      colorCache.clear();
    },
  };
}
/**
 * Generate a color palette with specified number of colors
 * @param count - Number of colors to generate
 * @param baseHue - Base hue value (0-360)
 * @param saturation - Saturation value (0-1)
 * @param lightness - Lightness value (0-1)
 * @returns Array of OKLCH color strings
 */
export function generateColorPalette(
  count,
  baseHue = 0,
  saturation = 0.3,
  lightness = 0.6,
) {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * hueStep) % 360;
    const color = {
      l: lightness * 100,
      c: saturation,
      h: hue,
    };
    colors.push(formatOKLCH(color));
  }
  return colors;
}
/**
 * Generate complementary colors
 * @param baseColor - Base OKLCH color
 * @returns Array of complementary colors
 */
export function generateComplementaryColors(baseColor) {
  return [
    baseColor,
    { ...baseColor, h: (baseColor.h + 180) % 360 },
    { ...baseColor, h: (baseColor.h + 90) % 360 },
    { ...baseColor, h: (baseColor.h + 270) % 360 },
  ];
}
/**
 * Adjust color lightness
 * @param color - Base OKLCH color
 * @param factor - Lightness adjustment factor (0.5 = 50% lighter, 2.0 = 100% darker)
 * @returns Adjusted OKLCH color
 */
export function adjustLightness(color, factor) {
  return {
    ...color,
    l: Math.max(0, Math.min(100, color.l * factor)),
  };
}
/**
 * Adjust color saturation
 * @param color - Base OKLCH color
 * @param factor - Saturation adjustment factor
 * @returns Adjusted OKLCH color
 */
export function adjustSaturation(color, factor) {
  return {
    ...color,
    c: Math.max(0, Math.min(0.4, color.c * factor)),
  };
}
