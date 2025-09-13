/**
 * 🦊 Spell Color Schemes
 * OKLCH color definitions for different magic types
 */

import type { SpellType, ColorScheme } from "./SpellEffectTypes";

export const SPELL_COLORS: Record<SpellType, ColorScheme> = {
  fire: {
    primary: "oklch(60% 0.4 30)",
    secondary: "oklch(70% 0.3 45)",
    accent: "oklch(50% 0.5 20)",
    background: "oklch(20% 0.1 30)",
    glow: "oklch(80% 0.6 35)",
  },
  ice: {
    primary: "oklch(70% 0.2 220)",
    secondary: "oklch(80% 0.15 240)",
    accent: "oklch(50% 0.3 200)",
    background: "oklch(15% 0.05 220)",
    glow: "oklch(90% 0.4 230)",
  },
  lightning: {
    primary: "oklch(80% 0.5 280)",
    secondary: "oklch(90% 0.4 300)",
    accent: "oklch(60% 0.6 260)",
    background: "oklch(10% 0.1 280)",
    glow: "oklch(95% 0.7 290)",
  },
  earth: {
    primary: "oklch(45% 0.2 60)",
    secondary: "oklch(55% 0.15 70)",
    accent: "oklch(35% 0.25 50)",
    background: "oklch(20% 0.1 60)",
    glow: "oklch(65% 0.3 65)",
  },
  water: {
    primary: "oklch(60% 0.25 200)",
    secondary: "oklch(70% 0.2 210)",
    accent: "oklch(40% 0.3 190)",
    background: "oklch(15% 0.1 200)",
    glow: "oklch(80% 0.4 205)",
  },
  wind: {
    primary: "oklch(75% 0.15 180)",
    secondary: "oklch(85% 0.1 190)",
    accent: "oklch(55% 0.2 170)",
    background: "oklch(20% 0.05 180)",
    glow: "oklch(90% 0.3 185)",
  },
  light: {
    primary: "oklch(85% 0.2 60)",
    secondary: "oklch(90% 0.15 70)",
    accent: "oklch(70% 0.25 50)",
    background: "oklch(25% 0.1 60)",
    glow: "oklch(95% 0.4 65)",
  },
  shadow: {
    primary: "oklch(30% 0.1 300)",
    secondary: "oklch(40% 0.05 310)",
    accent: "oklch(20% 0.15 290)",
    background: "oklch(5% 0.02 300)",
    glow: "oklch(50% 0.2 305)",
  },
  healing: {
    primary: "oklch(70% 0.3 140)",
    secondary: "oklch(80% 0.25 150)",
    accent: "oklch(50% 0.35 130)",
    background: "oklch(20% 0.1 140)",
    glow: "oklch(85% 0.5 145)",
  },
  chaos: {
    primary: "oklch(60% 0.4 0)",
    secondary: "oklch(70% 0.3 30)",
    accent: "oklch(40% 0.5 330)",
    background: "oklch(10% 0.1 0)",
    glow: "oklch(80% 0.6 15)",
  },
};

export function getSpellColors(spellType: SpellType): ColorScheme {
  return SPELL_COLORS[spellType];
}
