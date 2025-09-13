/**
 * 🦊 Spell Effect Types
 * Mathematical magic system based on phyllotactic patterns
 */

export interface SpellEffect {
  id: string;
  name: string;
  type: SpellType;
  pattern: PhyllotacticPattern;
  colorScheme: ColorScheme;
  intensity: number;
  duration: number;
  radius: number;
  speed: number;
}

export type SpellType = 
  | "fire" 
  | "ice" 
  | "lightning" 
  | "earth" 
  | "water" 
  | "wind" 
  | "light" 
  | "shadow"
  | "healing"
  | "chaos";

export interface PhyllotacticPattern {
  name: string;
  pointCount: number;
  spiralGrowth: number;
  baseRadius: number;
  rotationSpeed: number;
  description: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  glow: string;
}

export interface SpellAnimation {
  isActive: boolean;
  startTime: number;
  duration: number;
  progress: number;
  intensity: number;
}
