/**
 * Advanced Material Pattern Library
 * Implements material-specific color ramping with highlight preservation
 */

import type { OKLCHColor } from '../types';
import { clampToGamut, handleEdgeCases } from './colorConversion';
// import { basicColorRamp } from './colorRamping';

/**
 * Material type definitions
 */
export type MaterialType = 
  | 'fabric' 
  | 'plastic' 
  | 'metal' 
  | 'skin' 
  | 'wood' 
  | 'stone' 
  | 'glass' 
  | 'ceramic' 
  | 'leather' 
  | 'custom';

/**
 * Material pattern configuration
 */
export interface MaterialPattern {
  name: string;
  description: string;
  shadowShift: number;        // Hue shift for shadows (degrees)
  highlightShift: number;     // Hue shift for highlights (degrees)
  chromaBoost: number;        // Chroma increase factor
  lightnessRange: number;     // Total lightness variation range
  highlightPreservation: {
    enabled: boolean;         // Whether to preserve highlights
    threshold: number;        // Lightness threshold for highlight preservation (0-100)
    desaturation: number;     // Amount to desaturate highlights (0-1)
  };
  shadowEnhancement: {
    enabled: boolean;         // Whether to enhance shadows
    threshold: number;        // Lightness threshold for shadow enhancement (0-100)
    coolShift: number;        // Additional cool hue shift for shadows (degrees)
  };
  midtoneAdjustment: {
    enabled: boolean;         // Whether to adjust midtones
    hueShift: number;         // Hue shift for midtones (degrees)
    chromaAdjustment: number; // Chroma adjustment for midtones
  };
}

/**
 * Predefined material patterns based on research
 */
export const MATERIAL_PATTERNS: Record<MaterialType, MaterialPattern> = {
  fabric: {
    name: 'Fabric',
    description: 'Cloth and textile materials with subtle color bleeding',
    shadowShift: 15,
    highlightShift: 10,
    chromaBoost: 0.05,
    lightnessRange: 40,
    highlightPreservation: {
      enabled: false, // Fabric doesn't have strong specular highlights
      threshold: 85,
      desaturation: 0.1
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 30,
      coolShift: 10 // Cooler shadows for fabric
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 5,
      chromaAdjustment: 0.02
    }
  },

  plastic: {
    name: 'Plastic',
    description: 'Smooth plastic with white specular highlights',
    shadowShift: 10,
    highlightShift: 20,
    chromaBoost: 0.12,
    lightnessRange: 45,
    highlightPreservation: {
      enabled: true, // Preserve white highlights
      threshold: 80,
      desaturation: 0.3
    },
    shadowEnhancement: {
      enabled: false,
      threshold: 25,
      coolShift: 5
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 8,
      chromaAdjustment: 0.05
    }
  },

  metal: {
    name: 'Metal',
    description: 'Colored metal with tinted specular reflections',
    shadowShift: 30,
    highlightShift: 15,
    chromaBoost: 0.15,
    lightnessRange: 50,
    highlightPreservation: {
      enabled: true, // Preserve metallic highlights
      threshold: 75,
      desaturation: 0.2
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 20,
      coolShift: 15 // Stronger cool shift for metal shadows
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 12,
      chromaAdjustment: 0.08
    }
  },

  skin: {
    name: 'Skin',
    description: 'Human skin with subsurface scattering effects',
    shadowShift: 20,
    highlightShift: 25,
    chromaBoost: 0.08,
    lightnessRange: 35,
    highlightPreservation: {
      enabled: false, // Skin doesn't have strong specular highlights
      threshold: 85,
      desaturation: 0.05
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 40,
      coolShift: 15 // Cool shadows for skin (blood/veins)
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 3, // Very subtle for natural skin
      chromaAdjustment: 0.01
    }
  },

  wood: {
    name: 'Wood',
    description: 'Wood grain with natural color variation',
    shadowShift: 12,
    highlightShift: 8,
    chromaBoost: 0.06,
    lightnessRange: 35,
    highlightPreservation: {
      enabled: false,
      threshold: 80,
      desaturation: 0.1
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 30,
      coolShift: 8
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 4,
      chromaAdjustment: 0.03
    }
  },

  stone: {
    name: 'Stone',
    description: 'Natural stone with mineral color variations',
    shadowShift: 8,
    highlightShift: 5,
    chromaBoost: 0.04,
    lightnessRange: 30,
    highlightPreservation: {
      enabled: false,
      threshold: 85,
      desaturation: 0.15
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 25,
      coolShift: 6
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 2,
      chromaAdjustment: 0.01
    }
  },

  glass: {
    name: 'Glass',
    description: 'Transparent glass with refraction effects',
    shadowShift: 5,
    highlightShift: 30,
    chromaBoost: 0.08,
    lightnessRange: 60,
    highlightPreservation: {
      enabled: true, // Strong highlight preservation for glass
      threshold: 70,
      desaturation: 0.4
    },
    shadowEnhancement: {
      enabled: false,
      threshold: 20,
      coolShift: 3
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 6,
      chromaAdjustment: 0.04
    }
  },

  ceramic: {
    name: 'Ceramic',
    description: 'Glazed ceramic with smooth surface',
    shadowShift: 8,
    highlightShift: 15,
    chromaBoost: 0.10,
    lightnessRange: 40,
    highlightPreservation: {
      enabled: true,
      threshold: 75,
      desaturation: 0.25
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 30,
      coolShift: 7
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 5,
      chromaAdjustment: 0.04
    }
  },

  leather: {
    name: 'Leather',
    description: 'Natural leather with organic color variation',
    shadowShift: 18,
    highlightShift: 12,
    chromaBoost: 0.07,
    lightnessRange: 35,
    highlightPreservation: {
      enabled: false,
      threshold: 80,
      desaturation: 0.1
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 35,
      coolShift: 12
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 6,
      chromaAdjustment: 0.03
    }
  },

  custom: {
    name: 'Custom',
    description: 'User-defined material pattern',
    shadowShift: 20,
    highlightShift: 15,
    chromaBoost: 0.10,
    lightnessRange: 40,
    highlightPreservation: {
      enabled: true,
      threshold: 80,
      desaturation: 0.2
    },
    shadowEnhancement: {
      enabled: true,
      threshold: 30,
      coolShift: 10
    },
    midtoneAdjustment: {
      enabled: true,
      hueShift: 8,
      chromaAdjustment: 0.05
    }
  }
};

/**
 * Apply material-specific color ramping with highlight preservation
 * @param baseColor - Base OKLCH color
 * @param material - Material type
 * @param intensity - Shift intensity (0-1)
 * @returns Material-adjusted colors (shadow, base, highlight)
 */
export function applyMaterialPattern(
  baseColor: OKLCHColor,
  material: MaterialType,
  intensity: number = 1.0
): { shadow: OKLCHColor; base: OKLCHColor; highlight: OKLCHColor } {
  const pattern = MATERIAL_PATTERNS[material];
  const { l, c, h } = baseColor;
  
  // Calculate shadow color
  let shadow: OKLCHColor = {
    l: Math.max(0, l - (pattern.lightnessRange * 0.6 * intensity)),
    c: Math.min(0.4, c + (pattern.chromaBoost * intensity)),
    h: (h - (pattern.shadowShift * intensity) + 360) % 360
  };
  
  // Apply shadow enhancement if enabled
  if (pattern.shadowEnhancement.enabled && shadow.l <= pattern.shadowEnhancement.threshold) {
    shadow.h = (shadow.h - pattern.shadowEnhancement.coolShift + 360) % 360;
  }
  
  // Calculate highlight color
  let highlight: OKLCHColor = {
    l: Math.min(100, l + (pattern.lightnessRange * 0.4 * intensity)),
    c: Math.min(0.4, c + (pattern.chromaBoost * 0.5 * intensity)),
    h: (h + (pattern.highlightShift * intensity) + 360) % 360
  };
  
  // Apply highlight preservation if enabled
  if (pattern.highlightPreservation.enabled && highlight.l >= pattern.highlightPreservation.threshold) {
    highlight.c = Math.max(0.01, highlight.c - pattern.highlightPreservation.desaturation);
    // Keep hue closer to original for very bright highlights
    const hueInfluence = Math.max(0, 1 - (highlight.l - pattern.highlightPreservation.threshold) / 20);
    highlight.h = h + (highlight.h - h) * hueInfluence;
  }
  
  // Calculate base color with midtone adjustment
  let base: OKLCHColor = { l, c, h };
  if (pattern.midtoneAdjustment.enabled) {
    base = {
      l: l,
      c: Math.min(0.4, c + pattern.midtoneAdjustment.chromaAdjustment * intensity),
      h: (h + pattern.midtoneAdjustment.hueShift * intensity + 360) % 360
    };
  }
  
  return {
    shadow: handleEdgeCases(clampToGamut(shadow)),
    base: handleEdgeCases(clampToGamut(base)),
    highlight: handleEdgeCases(clampToGamut(highlight))
  };
}

/**
 * Generate a complete material ramp
 * @param baseColor - Base OKLCH color
 * @param material - Material type
 * @param stops - Number of color stops
 * @param intensity - Shift intensity (0-1)
 * @returns Array of OKLCH colors
 */
export function generateMaterialRamp(
  baseColor: OKLCHColor,
  material: MaterialType,
  stops: number = 5,
  _intensity: number = 1.0
): OKLCHColor[] {
  const pattern = MATERIAL_PATTERNS[material];
  const colors: OKLCHColor[] = [];
  const { l, c, h } = baseColor;
  
  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1); // 0 to 1
    const lightness = l + (t - 0.5) * pattern.lightnessRange;
    const chroma = c + Math.sin(t * Math.PI) * pattern.chromaBoost;
    
    // Calculate hue shift based on position
    let hueShift = 0;
    if (t < 0.5) {
      // Shadow side
      hueShift = -pattern.shadowShift * (0.5 - t) * 2;
      if (pattern.shadowEnhancement.enabled && lightness <= pattern.shadowEnhancement.threshold) {
        hueShift -= pattern.shadowEnhancement.coolShift;
      }
    } else {
      // Highlight side
      hueShift = pattern.highlightShift * (t - 0.5) * 2;
    }
    
    let color: OKLCHColor = {
      l: Math.max(0, Math.min(100, lightness)),
      c: Math.max(0.01, Math.min(0.4, chroma)),
      h: (h + hueShift + 360) % 360
    };
    
    // Apply highlight preservation
    if (pattern.highlightPreservation.enabled && color.l >= pattern.highlightPreservation.threshold) {
      color.c = Math.max(0.01, color.c - pattern.highlightPreservation.desaturation);
      const hueInfluence = Math.max(0, 1 - (color.l - pattern.highlightPreservation.threshold) / 20);
      color.h = h + (color.h - h) * hueInfluence;
    }
    
    colors.push(handleEdgeCases(clampToGamut(color)));
  }
  
  return colors;
}

/**
 * Create a custom material pattern
 * @param config - Custom material configuration
 * @returns Custom material pattern
 */
export function createCustomMaterial(config: Partial<MaterialPattern>): MaterialPattern {
  return {
    name: config.name || 'Custom Material',
    description: config.description || 'User-defined material pattern',
    shadowShift: config.shadowShift || 20,
    highlightShift: config.highlightShift || 15,
    chromaBoost: config.chromaBoost || 0.10,
    lightnessRange: config.lightnessRange || 40,
    highlightPreservation: {
      enabled: config.highlightPreservation?.enabled ?? true,
      threshold: config.highlightPreservation?.threshold ?? 80,
      desaturation: config.highlightPreservation?.desaturation ?? 0.2
    },
    shadowEnhancement: {
      enabled: config.shadowEnhancement?.enabled ?? true,
      threshold: config.shadowEnhancement?.threshold ?? 30,
      coolShift: config.shadowEnhancement?.coolShift ?? 10
    },
    midtoneAdjustment: {
      enabled: config.midtoneAdjustment?.enabled ?? true,
      hueShift: config.midtoneAdjustment?.hueShift ?? 8,
      chromaAdjustment: config.midtoneAdjustment?.chromaAdjustment ?? 0.05
    }
  };
}

/**
 * Get all available material types
 * @returns Array of material type names
 */
export function getAvailableMaterials(): MaterialType[] {
  return Object.keys(MATERIAL_PATTERNS) as MaterialType[];
}

/**
 * Get material pattern by type
 * @param material - Material type
 * @returns Material pattern configuration
 */
export function getMaterialPattern(material: MaterialType): MaterialPattern {
  return MATERIAL_PATTERNS[material];
}
