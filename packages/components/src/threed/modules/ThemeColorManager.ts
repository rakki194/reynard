/**
 * Theme Color Manager Module
 * Handles theme-aware color generation and background color management
 */

export interface ThemeColorConfig {
  theme: string;
}

export class ThemeColorManager {
  private config: ThemeColorConfig;

  constructor(config: ThemeColorConfig) {
    this.config = config;
  }

  getBackgroundColor(): string {
    const colors = {
      light: '#ffffff',
      dark: '#1a1a1a',
      gray: '#2a2a2a',
      banana: '#fff8dc',
      strawberry: '#ffe4e1',
      peanut: '#f5deb3'
    };
    return colors[this.config.theme as keyof typeof colors] || '#1a1a1a';
  }

  updateTheme(newTheme: string) {
    this.config.theme = newTheme;
  }

  getThemeColors(): string[] {
    // This would integrate with the visualization engine
    // For now, return a basic color palette
    const colorPalettes = {
      light: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
      dark: ['#60a5fa', '#f87171', '#34d399', '#fbbf24'],
      gray: ['#9ca3af', '#ef4444', '#10b981', '#f59e0b'],
      banana: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
      strawberry: ['#f87171', '#ef4444', '#dc2626', '#991b1b'],
      peanut: ['#d97706', '#b45309', '#92400e', '#78350f']
    };
    return colorPalettes[this.config.theme as keyof typeof colorPalettes] || colorPalettes.dark;
  }

  // Convert OKLCH to hex for Three.js compatibility
  oklchToHex(oklchColor: string): string {
    // Simple conversion - in a real implementation, you'd use a proper color conversion library
    // For now, we'll use a mapping of common OKLCH values to hex
    const oklchToHexMap: Record<string, string> = {
      'oklch(60% 0.3 0)': '#ff6b6b',
      'oklch(60% 0.3 45)': '#4ecdc4', 
      'oklch(60% 0.3 90)': '#45b7d1',
      'oklch(60% 0.3 135)': '#96ceb4',
      'oklch(60% 0.3 180)': '#feca57',
      'oklch(60% 0.3 225)': '#ff9ff3',
      'oklch(60% 0.3 270)': '#a8e6cf',
      'oklch(60% 0.3 315)': '#ffd3a5'
    };
    
    return oklchToHexMap[oklchColor] || '#60a5fa';
  }
}
