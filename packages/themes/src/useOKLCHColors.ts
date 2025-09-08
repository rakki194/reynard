/**
 * OKLCH Color Hooks
 * React hooks for using OKLCH colors in components
 */

import { createMemo } from "solid-js";
import { useTheme } from "./ThemeProvider";
import {
  getOKLCHCSSColor,
  generateColorVariant,
  generateThemeColorPalette,
  generateTagColor,
  generateComplementaryColors,
  generateOKLCHGradient,
} from "./oklchColors";
import { oklchStringToRgb } from "./colorConversion";
import { createTagColorGenerator } from "reynard-color-media";

/**
 * Hook to get OKLCH colors for the current theme
 */
export function useOKLCHColors() {
  const themeContext = useTheme();
  
  const colors = createMemo(() => {
    const currentTheme = themeContext.theme;
    return generateThemeColorPalette(currentTheme);
  });

  const getColor = (colorName: string): string => {
    return getOKLCHCSSColor(themeContext.theme, colorName);
  };

  const getColorVariant = (
    colorName: string, 
    variant: 'lighter' | 'darker' | 'hover' | 'active',
    intensity?: number
  ): string => {
    return generateColorVariant(themeContext.theme, colorName, variant, intensity);
  };

  const getGradient = (
    startColor: string, 
    endColor: string, 
    direction?: string
  ): string => {
    return generateOKLCHGradient(themeContext.theme, startColor, endColor, direction);
  };

  const getComplementaryColors = (colorName: string): string[] => {
    return generateComplementaryColors(themeContext.theme, colorName);
  };

  const theme = createMemo(() => themeContext.theme);

  return {
    colors: colors(),
    getColor,
    getColorVariant,
    getGradient,
    getComplementaryColors,
    theme: theme(),
  };
}

/**
 * Hook to generate dynamic tag colors
 */
export function useTagColors() {
  const themeContext = useTheme();
  const tagColorGenerator = createTagColorGenerator();
  
  const getTagColor = createMemo(() => (tag: string, intensity: number = 1.0): string => {
    return generateTagColor(themeContext.theme, tag, intensity);
  });

  const getTagStyle = createMemo(() => (tag: string, intensity: number = 1.0) => {
    // Access theme to make this reactive to theme changes
    const currentTheme = themeContext.theme;
    
    console.log(`getTagStyle called for tag: ${tag}, theme: ${currentTheme}`);
    
    const backgroundColor = generateTagColor(currentTheme, tag, intensity);
    
    // Generate text color based on background lightness for better contrast
    const baseColor = tagColorGenerator.getTagColor(currentTheme, tag, intensity);
    
    // Improved text color logic for better contrast
    let textColor: string;
    if (baseColor.l > 70) {
      // Very light backgrounds - use dark text
      textColor = `oklch(15% 0.02 ${baseColor.h})`;
    } else if (baseColor.l < 30) {
      // Very dark backgrounds - use light text
      textColor = `oklch(95% 0.02 ${baseColor.h})`;
    } else {
      // Medium lightness backgrounds - use white text for better contrast
      textColor = `oklch(98% 0.01 ${baseColor.h})`;
    }
    
    // Convert OKLCH to RGB for better browser support
    const rgbBackground = oklchStringToRgb(backgroundColor);
    const rgbText = oklchStringToRgb(textColor);
    
    const result = {
      backgroundColor: rgbBackground,
      color: rgbText,
      '--tag-bg': backgroundColor,
      '--tag-color': textColor,
    };
    
    console.log(`getTagStyle result for ${tag}:`, result);
    
    return result;
  });

  return {
    getTagColor: getTagColor(),
    getTagStyle: getTagStyle(),
  };
}

/**
 * Hook for color palette generation
 */
export function useColorPalette() {
  const generatePalette = (baseColor: string, count: number = 5): string[] => {
    const colors: string[] = [];
    
    // Generate variations of the base color
    for (let i = 0; i < count; i++) {
      const lightness = 20 + (i * 15); // 20, 35, 50, 65, 80
      const chroma = 0.1 + (i * 0.05); // 0.1, 0.15, 0.2, 0.25, 0.3
      const hue = (i * 72) % 360; // Spread hues around the color wheel
      
      colors.push(`oklch(${lightness}% ${chroma} ${hue})`);
    }
    
    return colors;
  };

  const generateMonochromaticPalette = (baseColor: string, count: number = 5): string[] => {
    const colors: string[] = [];
    
    // Extract hue from base color (simplified - in real implementation you'd parse OKLCH)
    const baseHue = 240; // Default hue, should be extracted from baseOKLCH
    
    for (let i = 0; i < count; i++) {
      const lightness = 20 + (i * 20); // 20, 40, 60, 80, 100
      const chroma = 0.1 + (i * 0.05); // Increasing chroma
      
      colors.push(`oklch(${lightness}% ${chroma} ${baseHue})`);
    }
    
    return colors;
  };

  return {
    generatePalette,
    generateMonochromaticPalette,
  };
}

/**
 * Hook for theme-aware color utilities
 */
export function useThemeColors() {
  const themeContext = useTheme();
  const oklchColors = useOKLCHColors();
  
  const isDark = createMemo(() => themeContext.isDark);
  const isHighContrast = createMemo(() => themeContext.isHighContrast);
  
  const getContrastColor = (_backgroundColor: string): string => {
    // Simple contrast logic - in real implementation you'd calculate actual contrast
    return isDark() ? oklchColors.getColor('text') : oklchColors.getColor('text');
  };

  const getSurfaceColor = (elevation: number = 0): string => {
    if (elevation === 0) return oklchColors.getColor('surface');
    if (elevation === 1) return oklchColors.getColorVariant('surface', 'lighter', 0.1);
    if (elevation === 2) return oklchColors.getColorVariant('surface', 'lighter', 0.2);
    return oklchColors.getColorVariant('surface', 'lighter', 0.3);
  };

  const getTextColor = (variant: 'primary' | 'secondary' | 'tertiary' = 'primary'): string => {
    switch (variant) {
      case 'primary': return oklchColors.getColor('text');
      case 'secondary': return oklchColors.getColorVariant('text', 'lighter', 0.3);
      case 'tertiary': return oklchColors.getColorVariant('text', 'lighter', 0.5);
      default: return oklchColors.getColor('text');
    }
  };

  return {
    ...oklchColors,
    isDark: isDark(),
    isHighContrast: isHighContrast(),
    getContrastColor,
    getSurfaceColor,
    getTextColor,
  };
}
