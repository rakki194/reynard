/**
 * 🦊 Spell Pattern Definitions
 * Mathematical patterns for different magic types
 */

import type { SpellType, PhyllotacticPattern } from "./SpellEffectTypes";

export const SPELL_PATTERNS: Record<SpellType, PhyllotacticPattern> = {
  fire: {
    name: "Flame Spiral",
    pointCount: 150,
    spiralGrowth: 2.8,
    baseRadius: 25,
    rotationSpeed: 3.0,
    description: "Rapid, chaotic fire magic with intense energy",
  },
  ice: {
    name: "Crystal Formation",
    pointCount: 200,
    spiralGrowth: 1.5,
    baseRadius: 20,
    rotationSpeed: 0.8,
    description: "Slow, precise ice crystals with geometric precision",
  },
  lightning: {
    name: "Electric Discharge",
    pointCount: 80,
    spiralGrowth: 4.0,
    baseRadius: 30,
    rotationSpeed: 5.0,
    description: "Fast, jagged lightning with high energy bursts",
  },
  earth: {
    name: "Stone Spiral",
    pointCount: 120,
    spiralGrowth: 2.0,
    baseRadius: 15,
    rotationSpeed: 1.2,
    description: "Steady, grounded earth magic with solid foundation",
  },
  water: {
    name: "Fluid Motion",
    pointCount: 180,
    spiralGrowth: 2.2,
    baseRadius: 22,
    rotationSpeed: 2.0,
    description: "Flowing water magic with smooth, organic movement",
  },
  wind: {
    name: "Air Currents",
    pointCount: 100,
    spiralGrowth: 3.5,
    baseRadius: 35,
    rotationSpeed: 4.0,
    description: "Swift wind magic with wide, sweeping motions",
  },
  light: {
    name: "Divine Radiance",
    pointCount: 250,
    spiralGrowth: 1.8,
    baseRadius: 18,
    rotationSpeed: 1.5,
    description: "Pure light magic with gentle, healing energy",
  },
  shadow: {
    name: "Void Spiral",
    pointCount: 90,
    spiralGrowth: 2.5,
    baseRadius: 28,
    rotationSpeed: 2.5,
    description: "Dark shadow magic with mysterious, consuming energy",
  },
  healing: {
    name: "Life Force",
    pointCount: 300,
    spiralGrowth: 1.2,
    baseRadius: 12,
    rotationSpeed: 0.5,
    description: "Gentle healing magic with nurturing, restorative energy",
  },
  chaos: {
    name: "Reality Fracture",
    pointCount: 60,
    spiralGrowth: 5.0,
    baseRadius: 40,
    rotationSpeed: 6.0,
    description: "Unpredictable chaos magic with reality-bending effects",
  },
};

export function getSpellPattern(spellType: SpellType): PhyllotacticPattern {
  return SPELL_PATTERNS[spellType];
}