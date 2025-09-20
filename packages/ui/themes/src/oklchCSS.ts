/**
 * OKLCH CSS Generator
 * Generates CSS custom properties using OKLCH colors
 */

import type { ThemeName } from "./types";
import { generateThemeColorPalette } from "./oklchColors";

/**
 * Generate CSS custom properties for OKLCH colors
 */
export function generateOKLCHCSS(theme: ThemeName): string {
  const colorPalette = generateThemeColorPalette(theme);
  const cssVars: string[] = [];

  // Generate color variables
  Object.entries(colorPalette).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    cssVars.push(`  ${cssVarName}: ${value};`);
  });

  // Generate semantic color variables
  cssVars.push(`  --color-primary: ${colorPalette.primary};`);
  cssVars.push(`  --color-primary-hover: ${colorPalette.primaryHover};`);
  cssVars.push(`  --color-primary-active: ${colorPalette.primaryActive};`);
  cssVars.push(`  --color-accent: ${colorPalette.accent};`);
  cssVars.push(`  --color-accent-hover: ${colorPalette.accentHover};`);
  cssVars.push(`  --color-accent-active: ${colorPalette.accentActive};`);
  cssVars.push(`  --color-background: ${colorPalette.background};`);
  cssVars.push(`  --color-background-secondary: ${colorPalette.backgroundLight};`);
  cssVars.push(`  --color-surface: ${colorPalette.surface};`);
  cssVars.push(`  --color-surface-hover: ${colorPalette.surfaceHover};`);
  cssVars.push(`  --color-surface-active: ${colorPalette.surfaceActive};`);
  cssVars.push(`  --color-text: ${colorPalette.text};`);
  cssVars.push(`  --color-text-secondary: ${colorPalette.textLight};`);
  cssVars.push(`  --color-border: ${colorPalette.surfaceDark};`);
  cssVars.push(`  --color-success: ${colorPalette.success};`);
  cssVars.push(`  --color-warning: ${colorPalette.warning};`);
  cssVars.push(`  --color-error: ${colorPalette.error};`);
  cssVars.push(`  --color-info: ${colorPalette.info};`);

  // Generate gradient variables
  cssVars.push(`  --gradient-primary: linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.primaryHover});`);
  cssVars.push(`  --gradient-surface: linear-gradient(135deg, ${colorPalette.surface}, ${colorPalette.surfaceHover});`);
  cssVars.push(`  --gradient-accent: linear-gradient(135deg, ${colorPalette.accent}, ${colorPalette.accentHover});`);

  return `:root[data-theme="${theme}"] {\n${cssVars.join("\n")}\n}`;
}

/**
 * Generate complete OKLCH CSS for all themes
 */
export function generateAllOKLCHCSS(): string {
  const themes: ThemeName[] = [
    "light",
    "dark",
    "gray",
    "banana",
    "strawberry",
    "peanut",
    "high-contrast-black",
    "high-contrast-inverse",
  ];

  return themes.map(theme => generateOKLCHCSS(theme)).join("\n\n");
}

/**
 * Generate CSS for OKLCH utilities
 */
export function generateOKLCHUtilityCSS(): string {
  return `
/* OKLCH Color Utilities */
.oklch-primary { color: var(--color-primary); }
.oklch-secondary { color: var(--color-secondary); }
.oklch-accent { color: var(--color-accent); }
.oklch-background { background-color: var(--color-background); }
.oklch-surface { background-color: var(--color-surface); }
.oklch-text { color: var(--color-text); }
.oklch-text-secondary { color: var(--color-text-secondary); }
.oklch-border { border-color: var(--color-border); }

/* OKLCH Background Utilities */
.bg-oklch-primary { background-color: var(--color-primary); }
.bg-oklch-secondary { background-color: var(--color-secondary); }
.bg-oklch-accent { background-color: var(--color-accent); }
.bg-oklch-surface { background-color: var(--color-surface); }
.bg-oklch-success { background-color: var(--color-success); }
.bg-oklch-warning { background-color: var(--color-warning); }
.bg-oklch-error { background-color: var(--color-error); }
.bg-oklch-info { background-color: var(--color-info); }

/* OKLCH Gradient Utilities */
.gradient-oklch-primary { background: var(--gradient-primary); }
.gradient-oklch-surface { background: var(--gradient-surface); }
.gradient-oklch-accent { background: var(--gradient-accent); }

/* OKLCH Hover States */
.hover-oklch-primary:hover { color: var(--color-primary-hover); }
.hover-oklch-accent:hover { color: var(--color-accent-hover); }
.hover-bg-oklch-primary:hover { background-color: var(--color-primary-hover); }
.hover-bg-oklch-surface:hover { background-color: var(--color-surface-hover); }

/* OKLCH Active States */
.active-oklch-primary:active { color: var(--color-primary-active); }
.active-oklch-accent:active { color: var(--color-accent-active); }
.active-bg-oklch-primary:active { background-color: var(--color-primary-active); }
.active-bg-oklch-surface:active { background-color: var(--color-surface-active); }

/* OKLCH Border Utilities */
.border-oklch-primary { border-color: var(--color-primary); }
.border-oklch-accent { border-color: var(--color-accent); }
.border-oklch-surface { border-color: var(--color-surface); }
.border-oklch-border { border-color: var(--color-border); }

/* OKLCH Shadow Utilities */
.shadow-oklch-primary { box-shadow: 0 2px 4px var(--color-primary); }
.shadow-oklch-accent { box-shadow: 0 2px 4px var(--color-accent); }
.shadow-oklch-surface { box-shadow: 0 2px 4px var(--color-surface); }
`;
}

/**
 * Generate complete OKLCH CSS file content
 */
export function generateCompleteOKLCHCSS(): string {
  return `/**
 * OKLCH Color System CSS
 * Generated OKLCH-based color variables and utilities
 */

${generateAllOKLCHCSS()}

${generateOKLCHUtilityCSS()}
`;
}
