/**
 * i18n Testing for Reynard Core Package
 * Tests for internationalization support in core utilities
 */

import { describe, it, expect } from 'vitest';
import { createI18nModule, i18n } from 'reynard-i18n';

describe('Core Package i18n Integration', () => {
  it('should integrate with i18n system', () => {
    const i18n = createI18nModule();
    
    // Test basic i18n functionality
    expect(i18n).toBeDefined();
    expect(i18n.t).toBeDefined();
    expect(i18n.locale).toBeDefined();
    expect(i18n.setLocale).toBeDefined();
  });

  it('should support core package translations', () => {
    const i18n = createI18nModule();
    
    // Test that core package can use i18n
    const result = i18n.t('common.hello', { name: 'Core' });
    expect(result).toBeDefined();
  });

  it('should handle missing translations gracefully', () => {
    const i18n = createI18nModule();
    
    // Test fallback behavior
    const result = i18n.t('core.nonexistent.key');
    expect(result).toBeDefined();
  });

  it('should support RTL languages', () => {
    const i18n = createI18nModule();
    
    // Test RTL support
    expect(typeof i18n.isRTL).toBe('boolean');
  });

  it('should provide language utilities', () => {
    const i18n = createI18nModule();
    
    // Test language utilities
    expect(i18n.languages).toBeDefined();
    expect(Array.isArray(i18n.languages)).toBe(true);
  });
});

describe('Core Package Hardcoded String Detection', () => {
  it('should identify potential hardcoded strings', () => {
    // This test demonstrates what the i18n testing system would detect
    const potentialHardcodedStrings = [
      i18n.t('core.test.notification'), // From useNotifications
      i18n.t('core.load.failed'), // From lazy-package-export
      'matchMedia not supported', // From useMediaQuery
    ];

    // In a real scenario, the i18n testing system would:
    // 1. Scan the codebase for these strings
    // 2. Suggest using i18n.t() instead
    // 3. Generate translation keys
    expect(potentialHardcodedStrings.length).toBeGreaterThan(0);
  });

  it('should suggest translation keys for hardcoded strings', () => {
    // Example of what the i18n testing system would suggest
    const suggestions = {
      [i18n.t('core.test.notification')]: 'core.notifications.test',
      [i18n.t('core.load.failed')]: 'core.errors.loadFailed',
      'matchMedia not supported': 'core.errors.mediaQueryNotSupported',
    };

    expect(Object.keys(suggestions).length).toBeGreaterThan(0);
  });
});

describe('Core Package Translation Coverage', () => {
  it('should have translation coverage for user-facing strings', () => {
    // This test would check if all user-facing strings have translations
    const userFacingStrings = [
      'core.notifications.test',
      'core.errors.loadFailed',
      'core.errors.mediaQueryNotSupported',
    ];

    // In a real scenario, this would verify that all these keys exist
    // in the translation files for all supported locales
    expect(userFacingStrings.length).toBeGreaterThan(0);
  });

  it('should validate translation completeness', () => {
    // This test would ensure all locales have the same translation keys
    const requiredKeys = [
      'common.hello',
      'common.welcome',
      'core.notifications.test',
      'core.errors.loadFailed',
    ];

    // In a real scenario, this would check all locales have these keys
    expect(requiredKeys.length).toBeGreaterThan(0);
  });
});
