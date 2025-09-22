/**
 * ⚗️ Catalyst Color Configuration
 * Unified color scheme for all Reynard dev-tools
 */

import type { ColorConfig } from '../types/Logger.js';

export const DEFAULT_COLORS: ColorConfig = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

export const createColorConfig = (overrides?: Partial<ColorConfig>): ColorConfig => {
  return {
    ...DEFAULT_COLORS,
    ...overrides,
  };
};
