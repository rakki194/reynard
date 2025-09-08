/**
 * Tests for oklchStringToHex function
 */

import { oklchStringToHex, oklchStringToRgb } from '../colorConversion';

describe('oklchStringToHex', () => {
  it('should convert OKLCH string to hex format', () => {
    const result = oklchStringToHex('oklch(70% 0.2 120)');
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should return fallback hex color for invalid strings', () => {
    const result = oklchStringToHex('invalid-color');
    expect(result).toBe('#666666');
  });

  it('should produce consistent results with oklchStringToRgb', () => {
    const oklchString = 'oklch(50% 0.3 200)';
    const rgbString = oklchStringToRgb(oklchString);
    const hexString = oklchStringToHex(oklchString);
    
    // Extract RGB values from rgb() string
    const rgbMatch = rgbString.match(/rgb\((\d+), (\d+), (\d+)\)/);
    expect(rgbMatch).not.toBeNull();
    
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      const expectedHex = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
      expect(hexString.toLowerCase()).toBe(expectedHex.toLowerCase());
    }
  });
});
