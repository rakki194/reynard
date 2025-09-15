/**
 * I18n Translation Performance Utilities
 *
 * 🦦 *splashes with translation precision* Utilities for measuring
 * translation loading, language switching, and pluralization performance.
 */

import { Page } from "@playwright/test";

export class I18nTranslationUtils {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Measure translation loading performance
   */
  async measureTranslationLoad(translationKeys: string[]): Promise<number> {
    const startTime = performance.now();

    await this.page.evaluate(keys => {
      // Simulate translation loading
      keys.forEach(key => {
        const elements = document.querySelectorAll(`[data-translation-key="${key}"]`);
        elements.forEach(el => {
          el.textContent = `Translated: ${key}`;
        });
      });
    }, translationKeys);

    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure language switching performance
   */
  async measureLanguageSwitch(_fromLang: string, toLang: string): Promise<number> {
    const startTime = performance.now();

    // Switch language
    await this.page.click(`[data-testid="language-selector"]`);
    await this.page.click(`[data-testid="language-${toLang}"]`);

    // Wait for translations to load
    await this.page.waitForSelector(`[data-testid="translated-content"]`, { timeout: 5000 });

    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure pluralization performance
   */
  async measurePluralization(language: string, count: number): Promise<number> {
    const startTime = performance.now();

    await this.page.evaluate(
      ({ lang, count }) => {
        // Simulate pluralization
        const pluralForm = `plural_${lang}_${count}`;
        const elements = document.querySelectorAll('[data-testid="pluralization-test"]');
        elements.forEach(el => {
          el.textContent = pluralForm;
        });
      },
      { lang: language, count }
    );

    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Measure RTL layout switching performance
   */
  async measureRTLSwitch(language: string): Promise<number> {
    const startTime = performance.now();

    // Switch to RTL language
    await this.page.click(`[data-testid="language-selector"]`);
    await this.page.click(`[data-testid="language-${language}"]`);

    // Wait for RTL layout to apply
    await this.page.waitForSelector('[dir="rtl"]');

    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Get common translation keys for testing
   */
  getCommonTranslationKeys(): string[] {
    return [
      "common.loading",
      "common.save",
      "common.cancel",
      "common.delete",
      "common.edit",
      "common.close",
      "common.confirm",
      "common.error",
      "common.success",
      "common.warning",
      "common.info",
      "common.help",
      "common.back",
      "common.next",
      "common.previous",
      "common.finish",
      "common.start",
      "common.stop",
      "common.pause",
      "common.resume",
    ];
  }
}
