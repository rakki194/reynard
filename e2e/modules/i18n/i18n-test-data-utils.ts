/**
 * I18n Test Data Generation and Cleanup Utilities
 *
 * 🦦 *splashes with test data precision* Utilities for creating
 * and managing test data for i18n performance benchmarking.
 */

import { Page } from "@playwright/test";

export class I18nTestDataUtils {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Create performance test data
   */
  async createPerformanceTestData(): Promise<void> {
    await this.page.evaluate(() => {
      // Create test elements for benchmarking
      const testContainer = document.createElement("div");
      testContainer.id = "i18n-benchmark-container";

      // Add hardcoded text elements
      for (let i = 0; i < 100; i++) {
        const element = document.createElement("div");
        element.setAttribute("data-testid", "hardcoded-text");
        element.textContent = `Hardcoded text ${i}`;
        testContainer.appendChild(element);
      }

      // Add translation key elements
      const translationKeys = [
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

      translationKeys.forEach(key => {
        const element = document.createElement("div");
        element.setAttribute("data-translation-key", key);
        element.setAttribute("data-testid", "translated-content");
        element.textContent = `Translation: ${key}`;
        testContainer.appendChild(element);
      });

      // Add pluralization test elements
      for (let i = 0; i < 50; i++) {
        const element = document.createElement("div");
        element.setAttribute("data-testid", "pluralization-test");
        element.textContent = `Pluralization test ${i}`;
        testContainer.appendChild(element);
      }

      document.body.appendChild(testContainer);
    });
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    await this.page.evaluate(() => {
      const container = document.getElementById("i18n-benchmark-container");
      if (container) {
        container.remove();
      }
    });
  }

  /**
   * Create language selector elements for testing
   */
  async createLanguageSelector(): Promise<void> {
    await this.page.evaluate(() => {
      const selector = document.createElement("div");
      selector.setAttribute("data-testid", "language-selector");
      selector.innerHTML = `
        <button data-testid="language-en">English</button>
        <button data-testid="language-ja">日本語</button>
        <button data-testid="language-fr">Français</button>
        <button data-testid="language-ru">Русский</button>
        <button data-testid="language-zh">中文</button>
        <button data-testid="language-ar">العربية</button>
      `;
      document.body.appendChild(selector);
    });
  }

  /**
   * Create RTL test elements
   */
  async createRTLTestElements(): Promise<void> {
    await this.page.evaluate(() => {
      const rtlContainer = document.createElement("div");
      rtlContainer.setAttribute("data-testid", "rtl-container");
      rtlContainer.innerHTML = `
        <div dir="ltr">Left to Right Text</div>
        <div dir="rtl">Right to Left Text</div>
      `;
      document.body.appendChild(rtlContainer);
    });
  }

  /**
   * Clean up all test elements
   */
  async cleanupAllTestElements(): Promise<void> {
    await this.page.evaluate(() => {
      const elementsToRemove = ["i18n-benchmark-container", "language-selector", "rtl-container"];

      elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.remove();
        }
      });

      // Also remove by testid
      const testIds = ["language-selector", "rtl-container"];

      testIds.forEach(testId => {
        const elements = document.querySelectorAll(`[data-testid="${testId}"]`);
        elements.forEach(el => el.remove());
      });
    });
  }
}
