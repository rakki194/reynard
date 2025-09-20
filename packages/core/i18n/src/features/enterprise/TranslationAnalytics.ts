/**
 * Translation Analytics for Reynard framework
 * Enterprise-grade analytics and usage tracking for translations
 */

import type { LanguageCode } from "../../types";

export interface UsageStats {
  mostUsedKeys: Array<{ key: string; count: number }>;
  localeUsage: Array<{ locale: LanguageCode; count: number }>;
  totalUsage: number;
  totalTranslations: number;
  uniqueKeys: number;
  lastReset: Date;
}

export interface TranslationUsage {
  key: string;
  locale: LanguageCode;
  timestamp: Date;
  context?: string;
}

export interface AnalyticsOptions {
  enableTracking?: boolean;
  maxUsageHistory?: number;
  enableContextTracking?: boolean;
}

export class TranslationAnalytics {
  private usageHistory: TranslationUsage[] = [];
  private keyCounts: Map<string, number> = new Map();
  private localeCounts: Map<LanguageCode, number> = new Map();
  private options: Required<AnalyticsOptions>;
  private lastReset: Date = new Date();

  constructor(options: AnalyticsOptions = {}) {
    this.options = {
      enableTracking: true,
      maxUsageHistory: 10000,
      enableContextTracking: false,
      ...options,
    };
  }

  /**
   * Track translation usage
   */
  trackUsage(key: string, locale: LanguageCode, context?: string): void {
    if (!this.options.enableTracking) {
      return;
    }

    const usage: TranslationUsage = {
      key,
      locale,
      timestamp: new Date(),
      context: this.options.enableContextTracking ? context : undefined,
    };

    // Add to usage history
    this.usageHistory.push(usage);

    // Update key counts
    const currentKeyCount = this.keyCounts.get(key) || 0;
    this.keyCounts.set(key, currentKeyCount + 1);

    // Update locale counts
    const currentLocaleCount = this.localeCounts.get(locale) || 0;
    this.localeCounts.set(locale, currentLocaleCount + 1);

    // Keep history size within limits
    if (this.usageHistory.length > this.options.maxUsageHistory) {
      this.usageHistory = this.usageHistory.slice(-this.options.maxUsageHistory);
    }
  }

  /**
   * Get comprehensive usage statistics
   */
  getUsageStats(): UsageStats {
    const mostUsedKeys = Array.from(this.keyCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50); // Top 50 most used keys

    const localeUsage = Array.from(this.localeCounts.entries())
      .map(([locale, count]) => ({ locale, count }))
      .sort((a, b) => b.count - a.count);

    return {
      mostUsedKeys,
      localeUsage,
      totalUsage: this.usageHistory.length,
      totalTranslations: this.usageHistory.length,
      uniqueKeys: this.keyCounts.size,
      lastReset: this.lastReset,
    };
  }

  /**
   * Get usage history for a specific key
   */
  getKeyUsageHistory(key: string): TranslationUsage[] {
    return this.usageHistory.filter(usage => usage.key === key);
  }

  /**
   * Get usage history for a specific locale
   */
  getLocaleUsageHistory(locale: LanguageCode): TranslationUsage[] {
    return this.usageHistory.filter(usage => usage.locale === locale);
  }

  /**
   * Get recent usage (last N entries)
   */
  getRecentUsage(limit: number = 100): TranslationUsage[] {
    return this.usageHistory.slice(-limit);
  }

  /**
   * Get usage patterns by time
   */
  getUsageByTimeRange(startDate: Date, endDate: Date): TranslationUsage[] {
    return this.usageHistory.filter(usage => usage.timestamp >= startDate && usage.timestamp <= endDate);
  }

  /**
   * Get unused keys (keys that were tracked but not used recently)
   */
  getUnusedKeys(daysThreshold: number = 30): string[] {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const recentlyUsedKeys = new Set(
      this.usageHistory.filter(usage => usage.timestamp >= thresholdDate).map(usage => usage.key)
    );

    return Array.from(this.keyCounts.keys()).filter(key => !recentlyUsedKeys.has(key));
  }

  /**
   * Get most active locales
   */
  getMostActiveLocales(limit: number = 10): Array<{ locale: LanguageCode; count: number }> {
    return Array.from(this.localeCounts.entries())
      .map(([locale, count]) => ({ locale, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    const data = {
      usageStats: this.getUsageStats(),
      usageHistory: this.usageHistory,
      keyCounts: Object.fromEntries(this.keyCounts),
      localeCounts: Object.fromEntries(this.localeCounts),
      options: this.options,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Reset all analytics data
   */
  reset(): void {
    this.usageHistory = [];
    this.keyCounts.clear();
    this.localeCounts.clear();
    this.lastReset = new Date();
  }

  /**
   * Update analytics options
   */
  updateOptions(newOptions: Partial<AnalyticsOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Check if tracking is enabled
   */
  isTrackingEnabled(): boolean {
    return this.options.enableTracking;
  }

  /**
   * Enable or disable tracking
   */
  setTrackingEnabled(enabled: boolean): void {
    this.options.enableTracking = enabled;
  }
}
