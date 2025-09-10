/**
 * Example Usage Functions
 * Practical examples of how to use the OKLCH hue shifting algorithms
 */

import type { OKLCHColor } from 'reynard-colors';
import { generateSpriteColors } from './pixel-art-utils';
import { generateHueShiftRamp } from './core-algorithms';

/**
 * Example: Create a character sprite palette
 * @returns Array of OKLCH colors for character sprite
 */
export function createCharacterPalette(): OKLCHColor[] {
  const skinBase: OKLCHColor = { l: 70, c: 0.12, h: 30 };
  const hairBase: OKLCHColor = { l: 40, c: 0.15, h: 20 };
  const shirtBase: OKLCHColor = { l: 60, c: 0.2, h: 240 };
  
  const skinColors = generateSpriteColors(skinBase, 'character', 'skin');
  const hairColors = generateSpriteColors(hairBase, 'character', 'fabric');
  const shirtColors = generateSpriteColors(shirtBase, 'character', 'fabric');
  
  return [
    skinColors.shadow,
    skinColors.base,
    skinColors.highlight,
    hairColors.shadow,
    hairColors.base,
    hairColors.highlight,
    shirtColors.shadow,
    shirtColors.base,
    shirtColors.highlight
  ];
}

/**
 * Example: Create an environment tileset palette
 * @returns Array of OKLCH colors for environment tileset
 */
export function createEnvironmentPalette(): OKLCHColor[] {
  const grassBase: OKLCHColor = { l: 55, c: 0.18, h: 120 };
  const stoneBase: OKLCHColor = { l: 50, c: 0.05, h: 0 };
  const waterBase: OKLCHColor = { l: 65, c: 0.15, h: 200 };
  
  const grassRamp = generateHueShiftRamp(grassBase, 4);
  const stoneRamp = generateHueShiftRamp(stoneBase, 4);
  const waterRamp = generateHueShiftRamp(waterBase, 4);
  
  return [...grassRamp, ...stoneRamp, ...waterRamp];
}

/**
 * Example: Create a UI element palette
 * @returns Array of OKLCH colors for UI elements
 */
export function createUIPalette(): OKLCHColor[] {
  const primaryBase: OKLCHColor = { l: 60, c: 0.25, h: 220 };
  const secondaryBase: OKLCHColor = { l: 50, c: 0.15, h: 180 };
  const accentBase: OKLCHColor = { l: 70, c: 0.3, h: 320 };
  
  const primaryColors = generateSpriteColors(primaryBase, 'ui');
  const secondaryColors = generateSpriteColors(secondaryBase, 'ui');
  const accentColors = generateSpriteColors(accentBase, 'ui');
  
  return [
    primaryColors.shadow,
    primaryColors.base,
    primaryColors.highlight,
    secondaryColors.shadow,
    secondaryColors.base,
    secondaryColors.highlight,
    accentColors.shadow,
    accentColors.base,
    accentColors.highlight
  ];
}

/**
 * Example: Create a fantasy character palette
 * @returns Array of OKLCH colors for fantasy character
 */
export function createFantasyCharacterPalette(): OKLCHColor[] {
  const skinBase: OKLCHColor = { l: 75, c: 0.1, h: 25 };
  const hairBase: OKLCHColor = { l: 30, c: 0.2, h: 280 };
  const armorBase: OKLCHColor = { l: 45, c: 0.08, h: 0 };
  const capeBase: OKLCHColor = { l: 35, c: 0.25, h: 300 };
  
  const skinColors = generateSpriteColors(skinBase, 'character', 'skin');
  const hairColors = generateSpriteColors(hairBase, 'character', 'fabric');
  const armorColors = generateSpriteColors(armorBase, 'character', 'metal');
  const capeColors = generateSpriteColors(capeBase, 'character', 'fabric');
  
  return [
    skinColors.shadow,
    skinColors.base,
    skinColors.highlight,
    hairColors.shadow,
    hairColors.base,
    hairColors.highlight,
    armorColors.shadow,
    armorColors.base,
    armorColors.highlight,
    capeColors.shadow,
    capeColors.base,
    capeColors.highlight
  ];
}

/**
 * Example: Create a nature environment palette
 * @returns Array of OKLCH colors for nature environment
 */
export function createNatureEnvironmentPalette(): OKLCHColor[] {
  const grassBase: OKLCHColor = { l: 50, c: 0.2, h: 110 };
  const treeBase: OKLCHColor = { l: 35, c: 0.15, h: 100 };
  const rockBase: OKLCHColor = { l: 45, c: 0.05, h: 30 };
  const skyBase: OKLCHColor = { l: 80, c: 0.1, h: 210 };
  
  const grassRamp = generateHueShiftRamp(grassBase, 3);
  const treeRamp = generateHueShiftRamp(treeBase, 3);
  const rockRamp = generateHueShiftRamp(rockBase, 3);
  const skyRamp = generateHueShiftRamp(skyBase, 3);
  
  return [...grassRamp, ...treeRamp, ...rockRamp, ...skyRamp];
}

/**
 * Example: Create a sci-fi UI palette
 * @returns Array of OKLCH colors for sci-fi UI
 */
export function createSciFiUIPalette(): OKLCHColor[] {
  const primaryBase: OKLCHColor = { l: 70, c: 0.3, h: 180 };
  const secondaryBase: OKLCHColor = { l: 40, c: 0.2, h: 240 };
  const accentBase: OKLCHColor = { l: 85, c: 0.25, h: 120 };
  const warningBase: OKLCHColor = { l: 60, c: 0.35, h: 60 };
  
  const primaryColors = generateSpriteColors(primaryBase, 'ui');
  const secondaryColors = generateSpriteColors(secondaryBase, 'ui');
  const accentColors = generateSpriteColors(accentBase, 'ui');
  const warningColors = generateSpriteColors(warningBase, 'ui');
  
  return [
    primaryColors.shadow,
    primaryColors.base,
    primaryColors.highlight,
    secondaryColors.shadow,
    secondaryColors.base,
    secondaryColors.highlight,
    accentColors.shadow,
    accentColors.base,
    accentColors.highlight,
    warningColors.shadow,
    warningColors.base,
    warningColors.highlight
  ];
}
